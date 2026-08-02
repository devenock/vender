// Command worker runs the asynq background job processor (see
// docs/system-design.md §7) plus a small HTTP server exposing
// /healthz and /readyz for the same liveness/readiness checks the api
// process exposes. No task handlers are registered yet — each module
// that needs background work (notification, payment, analytics, ...)
// registers its own handlers on mux below once implemented.
package main

import (
	"context"
	"fmt"
	"os"

	"github.com/hibiken/asynq"

	"github.com/devenock/vender/backend/internal/platform/cache"
	"github.com/devenock/vender/backend/internal/platform/config"
	"github.com/devenock/vender/backend/internal/platform/db"
	"github.com/devenock/vender/backend/internal/platform/httpserver"
	"github.com/devenock/vender/backend/internal/platform/logger"
	"github.com/devenock/vender/backend/internal/platform/queue"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "worker: fatal:", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load(os.Getenv)
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	log := logger.New(cfg.Log.Level)
	log.Info("starting worker", "env", cfg.Env)

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

	// Health server, reusing the same router builder as cmd/api for
	// consistent /healthz and /readyz behavior.
	healthRouter := httpserver.NewRouter(httpserver.Deps{
		Logger: log,
		DB:     pool,
		Redis:  redisClient,
	})
	go func() {
		addr := ":" + healthPort(os.Getenv)
		if err := httpserver.Run(ctx, log, addr, healthRouter, cfg.Server.ShutdownTimeout); err != nil {
			log.Error("health server stopped", "error", err)
		}
	}()

	const defaultConcurrency = 10 // fixed for now; revisit if worker load requires tuning
	srv := queue.NewServer(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB, defaultConcurrency)
	mux := asynq.NewServeMux()

	// Task handlers are registered here as modules implement background
	// jobs, e.g.:
	//   mux.HandleFunc(notification.TypeSendEmail, notificationhandlers.HandleSendEmail(...))

	log.Info("worker consuming tasks")
	if err := srv.Run(mux); err != nil {
		return fmt.Errorf("run worker: %w", err)
	}
	return nil
}

func healthPort(getenv func(string) string) string {
	if p := getenv("WORKER_HEALTH_PORT"); p != "" {
		return p
	}
	return "8081"
}
