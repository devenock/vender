// Package logger configures the process-wide structured logger. Every
// component takes a *slog.Logger explicitly rather than reaching for a
// package-level global, so tests can inject their own.
package logger

import (
	"log/slog"
	"os"
	"strings"
)

// New builds a JSON slog.Logger writing to stdout at the given level
// ("debug"|"info"|"warn"|"error", case-insensitive; defaults to info).
func New(level string) *slog.Logger {
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: parseLevel(level),
	})
	return slog.New(handler)
}

func parseLevel(level string) slog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
