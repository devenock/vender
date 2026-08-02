// Command migrate applies or rolls back SQL migrations in ../../migrations
// using golang-migrate. It exists so `make migrate-up`/`make migrate-down`
// work from a single Go binary in every environment (local, CI, VPS)
// without requiring the golang-migrate CLI to be separately installed.
//
// Usage:
//
//	migrate up
//	migrate down
//	migrate version
package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"github.com/devenock/vender/backend/internal/platform/config"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "migrate: fatal:", err)
		os.Exit(1)
	}
}

func run() error {
	if len(os.Args) < 2 {
		return errors.New("usage: migrate <up|down|version>")
	}
	command := os.Args[1]

	cfg, err := config.Load(os.Getenv)
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	sourcePath := os.Getenv("MIGRATIONS_PATH")
	if sourcePath == "" {
		sourcePath = "migrations"
	}

	m, err := migrate.New("file://"+sourcePath, cfg.Postgres.DSN())
	if err != nil {
		return fmt.Errorf("init migrate: %w", err)
	}
	defer func() { _, _ = m.Close() }()

	switch command {
	case "up":
		err = m.Up()
	case "down":
		err = m.Down()
	case "version":
		version, dirty, verr := m.Version()
		if verr != nil {
			return fmt.Errorf("version: %w", verr)
		}
		fmt.Printf("version=%d dirty=%v\n", version, dirty)
		return nil
	default:
		return fmt.Errorf("unknown command %q: usage: migrate <up|down|version>", command)
	}

	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("%s: %w", command, err)
	}
	fmt.Printf("migrate %s: done\n", command)
	return nil
}
