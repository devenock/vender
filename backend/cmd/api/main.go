// Command api runs the HTTP server. It is the composition root for the
// api process: it is the only place allowed to construct concrete
// adapters and wire them into module application services (see
// docs/architecture.md §2). No modules are wired yet — see
// internal/modules/README.md.
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/devenock/vender/backend/internal/platform/cache"
	"github.com/devenock/vender/backend/internal/platform/config"
	"github.com/devenock/vender/backend/internal/platform/db"
	"github.com/devenock/vender/backend/internal/platform/httpserver"
	"github.com/devenock/vender/backend/internal/platform/logger"
	"github.com/devenock/vender/backend/internal/platform/session"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "api: fatal:", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load(os.Getenv)
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	log := logger.New(cfg.Log.Level)
	log.Info("starting api", "env", cfg.Env)

	ctx := context.Background()

	pool, err := db.NewPool(ctx, cfg.Postgres.DSN())
	if err != nil {
		return fmt.Errorf("connect postgres: %w", err)
	}
	defer pool.Close()

	redisClient, err := cache.NewClient(ctx, cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
	if err != nil {
		return fmt.Errorf("connect redis: %w", err)
	}
	defer func() { _ = redisClient.Close() }()

	sessionStore := session.NewStore(redisClient, cfg.Session.TTL)

	router := httpserver.NewRouter(httpserver.Deps{
		Logger:            log,
		DB:                pool,
		Redis:             redisClient,
		AllowedOrigins:    cfg.Server.AllowedOrigins,
		SessionStore:      sessionStore,
		SessionCookieName: cfg.Session.CookieName,
	})

	// Module route registration happens here, once modules exist, e.g.:
	//   identityapp := identity.NewService(identitypg.NewUserRepo(pool), sessionStore)
	//   identityhttp.RegisterRoutes(router, identityapp)

	addr := ":" + cfg.Server.Port
	return httpserver.Run(ctx, log, addr, router, cfg.Server.ShutdownTimeout)
}
