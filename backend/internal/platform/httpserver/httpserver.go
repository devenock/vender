// Package httpserver builds the chi router and middleware stack shared by
// every module's HTTP adapter, plus the health/readiness endpoints and a
// graceful-shutdown-aware Run helper. Modules mount their own routes onto
// the *chi.Mux returned by NewRouter from cmd/api/main.go — this package
// has no knowledge of any module.
package httpserver

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/devenock/vender/backend/internal/platform/session"
)

// Deps are the shared dependencies the base router needs. Individual
// modules receive their own (application service) dependencies directly,
// not through this struct.
type Deps struct {
	Logger         *slog.Logger
	DB             *pgxpool.Pool
	Redis          *redis.Client
	AllowedOrigins []string

	// SessionStore is optional: if nil, no session cookie is resolved
	// (useful for services/tests that don't need auth).
	SessionStore      *session.Store
	SessionCookieName string
}

// NewRouter builds the base router: request ID, logging, panic recovery,
// timeout, CORS, and (if configured) session resolution — plus /healthz
// and /readyz. Route registration for actual modules happens in
// cmd/api/main.go once modules exist.
func NewRouter(deps Deps) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	// Deliberately not using chi's middleware.RealIP: it's spoofable
	// (trusts X-Forwarded-For/X-Real-IP unconditionally). If/when a
	// module needs the client IP (e.g. rate limiting login attempts),
	// derive it from a trusted-proxy-aware source that only trusts the
	// immediate nginx hop, not the whole header chain.
	r.Use(requestLogger(deps.Logger))
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(cors(deps.AllowedOrigins))

	if deps.SessionStore != nil {
		r.Use(session.Middleware(deps.SessionStore, deps.SessionCookieName))
	}

	r.Get("/healthz", healthHandler)
	r.Get("/readyz", readyHandler(deps.DB, deps.Redis))

	return r
}

// Run starts srv and blocks until the process receives SIGINT/SIGTERM,
// then drains in-flight requests within shutdownTimeout before returning.
func Run(ctx context.Context, logger *slog.Logger, addr string, handler http.Handler, shutdownTimeout time.Duration) error {
	srv := &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	ctx, stop := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		logger.Info("http server listening", "addr", addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
			return
		}
		errCh <- nil
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
		logger.Info("shutdown signal received, draining connections", "timeout", shutdownTimeout)
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func readyHandler(pool *pgxpool.Pool, redisClient *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		checks := map[string]string{}
		ready := true

		if pool != nil {
			if err := pool.Ping(ctx); err != nil {
				checks["postgres"] = err.Error()
				ready = false
			} else {
				checks["postgres"] = "ok"
			}
		}
		if redisClient != nil {
			if err := redisClient.Ping(ctx).Err(); err != nil {
				checks["redis"] = err.Error()
				ready = false
			} else {
				checks["redis"] = "ok"
			}
		}

		status := http.StatusOK
		if !ready {
			status = http.StatusServiceUnavailable
		}
		writeJSON(w, status, map[string]any{"ready": ready, "checks": checks})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// requestLogger logs one structured line per request: method, path,
// status, duration, and request ID (for correlating with client-reported
// issues).
func requestLogger(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			next.ServeHTTP(ww, r)

			logger.Info("request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", ww.Status(),
				"bytes", ww.BytesWritten(),
				"duration_ms", time.Since(start).Milliseconds(),
				"request_id", middleware.GetReqID(r.Context()),
			)
		})
	}
}

// cors is a minimal allow-list CORS middleware — deliberately not pulling
// in a separate dependency for this. allowedOrigins of length 0 disables
// CORS headers entirely (same-origin only).
func cors(allowedOrigins []string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, o := range allowedOrigins {
		allowed[o] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if _, ok := allowed[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token")
				w.Header().Set("Vary", "Origin")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
