// Package session implements Redis-backed, cookie-carried sessions (see
// docs/system-design.md §6 and docs/architecture.md §6). It is
// deliberately domain-agnostic: it stores an opaque string->string bag
// per session ID and attaches it to the request context. The identity
// module owns what goes in that bag (user id, role, ...) and any typed
// accessors on top of it — this package only knows how to create, read,
// refresh, and destroy sessions.
package session

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

const keyPrefix = "session:"

type Store struct {
	redis *redis.Client
	ttl   time.Duration
}

func NewStore(client *redis.Client, ttl time.Duration) *Store {
	return &Store{redis: client, ttl: ttl}
}

// Create generates a new opaque session ID, stores data against it, and
// returns the ID to be set as a cookie value by the caller.
func (s *Store) Create(ctx context.Context, data map[string]string) (string, error) {
	id, err := newSessionID()
	if err != nil {
		return "", fmt.Errorf("session: generate id: %w", err)
	}

	pipe := s.redis.Pipeline()
	pipe.HSet(ctx, keyPrefix+id, toAnySlice(data))
	pipe.Expire(ctx, keyPrefix+id, s.ttl)
	if _, err := pipe.Exec(ctx); err != nil {
		return "", fmt.Errorf("session: create: %w", err)
	}
	return id, nil
}

// Get returns the session data for id, and false if the session doesn't
// exist or has expired.
func (s *Store) Get(ctx context.Context, id string) (map[string]string, bool, error) {
	data, err := s.redis.HGetAll(ctx, keyPrefix+id).Result()
	if err != nil {
		return nil, false, fmt.Errorf("session: get: %w", err)
	}
	if len(data) == 0 {
		return nil, false, nil
	}
	return data, true, nil
}

// Refresh slides the session's TTL forward, keeping an active user logged
// in without a fixed session lifetime.
func (s *Store) Refresh(ctx context.Context, id string) error {
	if err := s.redis.Expire(ctx, keyPrefix+id, s.ttl).Err(); err != nil {
		return fmt.Errorf("session: refresh: %w", err)
	}
	return nil
}

// Destroy invalidates a session immediately (logout).
func (s *Store) Destroy(ctx context.Context, id string) error {
	if err := s.redis.Del(ctx, keyPrefix+id).Err(); err != nil {
		return fmt.Errorf("session: destroy: %w", err)
	}
	return nil
}

func newSessionID() (string, error) {
	buf := make([]byte, 32) // 256 bits
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

func toAnySlice(data map[string]string) []any {
	out := make([]any, 0, len(data)*2)
	for k, v := range data {
		out = append(out, k, v)
	}
	return out
}

// --- Cookie helpers ---

// SetCookie attaches the session ID to the response as a Secure, HttpOnly
// cookie. secure should be false only for plain-http local development.
func SetCookie(w http.ResponseWriter, name, id string, ttl time.Duration, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    id,
		Path:     "/",
		MaxAge:   int(ttl.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	})
}

// ClearCookie expires the session cookie immediately (logout).
func ClearCookie(w http.ResponseWriter, name string, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	})
}

// --- Request context ---

type contextKey struct{}

var dataContextKey = contextKey{}

// Middleware resolves the session cookie (if present) into its data and
// attaches it to the request context, sliding the TTL forward on every
// authenticated request. Requests without a valid session pass through
// unmodified — enforcing that a session is required is a route-level
// concern (a separate RequireAuth middleware built on FromContext), not
// this middleware's job.
func Middleware(store *Store, cookieName string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(cookieName)
			if err != nil || cookie.Value == "" {
				next.ServeHTTP(w, r)
				return
			}

			ctx := r.Context()
			data, ok, err := store.Get(ctx, cookie.Value)
			if err != nil || !ok {
				next.ServeHTTP(w, r)
				return
			}
			_ = store.Refresh(ctx, cookie.Value)

			ctx = context.WithValue(ctx, dataContextKey, data)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// FromContext returns the session data attached by Middleware, if any.
func FromContext(ctx context.Context) (map[string]string, bool) {
	data, ok := ctx.Value(dataContextKey).(map[string]string)
	return data, ok
}
