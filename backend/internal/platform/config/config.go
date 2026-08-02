// Package config loads all runtime configuration from environment
// variables (12-factor style — no config files, no viper). Load fails
// fast, listing every missing required variable at once rather than one
// at a time, so a misconfigured deploy is obvious immediately.
package config

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Env      string // "development" | "staging" | "production"
	Server   ServerConfig
	Postgres PostgresConfig
	Redis    RedisConfig
	Session  SessionConfig
	MinIO    MinIOConfig
	Mpesa    MpesaConfig
	Stripe   StripeConfig
	Log      LogConfig
}

type ServerConfig struct {
	Port            string
	ShutdownTimeout time.Duration
	AllowedOrigins  []string
}

type PostgresConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	SSLMode  string
}

// DSN builds a libpq connection string from the discrete fields above,
// rather than requiring a single pre-built DATABASE_URL — keeps each
// piece individually overridable (e.g. in docker-compose) and avoids
// hand-assembled URL escaping bugs.
func (p PostgresConfig) DSN() string {
	u := url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(p.User, p.Password),
		Host:   fmt.Sprintf("%s:%s", p.Host, p.Port),
		Path:   "/" + p.Database,
	}
	q := u.Query()
	q.Set("sslmode", p.SSLMode)
	u.RawQuery = q.Encode()
	return u.String()
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type SessionConfig struct {
	CookieName string
	TTL        time.Duration
	Secure     bool // false only in local dev over http
}

type MinIOConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
}

type MpesaConfig struct {
	Env             string // "sandbox" | "production"
	ConsumerKey     string
	ConsumerSecret  string
	Shortcode       string
	Passkey         string
	CallbackBaseURL string
}

type StripeConfig struct {
	SecretKey      string
	WebhookSecret  string
	PublishableKey string
}

type LogConfig struct {
	Level string // "debug" | "info" | "warn" | "error"
}

// Load reads and validates configuration from the process environment.
// Payment provider credentials are intentionally NOT required here: they
// only become required once the payment module is implemented and wired
// up, so `make run` works for foundational/non-payment work without
// sandbox credentials on hand.
func Load(getenv func(string) string) (*Config, error) {
	var missing []string

	req := func(key string) string {
		v := getenv(key)
		if v == "" {
			missing = append(missing, key)
		}
		return v
	}
	opt := func(key, fallback string) string {
		if v := getenv(key); v != "" {
			return v
		}
		return fallback
	}
	optInt := func(key string, fallback int) int {
		v := getenv(key)
		if v == "" {
			return fallback
		}
		n, err := strconv.Atoi(v)
		if err != nil {
			missing = append(missing, key+" (must be an integer)")
			return fallback
		}
		return n
	}
	optBool := func(key string, fallback bool) bool {
		v := getenv(key)
		if v == "" {
			return fallback
		}
		b, err := strconv.ParseBool(v)
		if err != nil {
			missing = append(missing, key+" (must be true/false)")
			return fallback
		}
		return b
	}
	optDuration := func(key string, fallback time.Duration) time.Duration {
		v := getenv(key)
		if v == "" {
			return fallback
		}
		d, err := time.ParseDuration(v)
		if err != nil {
			missing = append(missing, key+" (must be a duration, e.g. 30s)")
			return fallback
		}
		return d
	}

	cfg := &Config{
		Env: opt("APP_ENV", "development"),
		Server: ServerConfig{
			Port:            opt("SERVER_PORT", "8080"),
			ShutdownTimeout: optDuration("SERVER_SHUTDOWN_TIMEOUT", 15*time.Second),
			AllowedOrigins:  splitCSV(opt("SERVER_ALLOWED_ORIGINS", "http://localhost:3000")),
		},
		Postgres: PostgresConfig{
			Host:     req("POSTGRES_HOST"),
			Port:     opt("POSTGRES_PORT", "5432"),
			User:     req("POSTGRES_USER"),
			Password: req("POSTGRES_PASSWORD"),
			Database: req("POSTGRES_DB"),
			SSLMode:  opt("POSTGRES_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Addr:     opt("REDIS_ADDR", "localhost:6379"),
			Password: opt("REDIS_PASSWORD", ""),
			DB:       optInt("REDIS_DB", 0),
		},
		Session: SessionConfig{
			CookieName: opt("SESSION_COOKIE_NAME", "sid"),
			TTL:        optDuration("SESSION_TTL", 7*24*time.Hour),
			Secure:     optBool("SESSION_COOKIE_SECURE", true),
		},
		MinIO: MinIOConfig{
			Endpoint:  opt("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey: req("MINIO_ACCESS_KEY"),
			SecretKey: req("MINIO_SECRET_KEY"),
			Bucket:    opt("MINIO_BUCKET", "fashion-store"),
			UseSSL:    optBool("MINIO_USE_SSL", false),
		},
		Mpesa: MpesaConfig{
			Env:             opt("MPESA_ENV", "sandbox"),
			ConsumerKey:     getenv("MPESA_CONSUMER_KEY"),
			ConsumerSecret:  getenv("MPESA_CONSUMER_SECRET"),
			Shortcode:       getenv("MPESA_SHORTCODE"),
			Passkey:         getenv("MPESA_PASSKEY"),
			CallbackBaseURL: getenv("MPESA_CALLBACK_BASE_URL"),
		},
		Stripe: StripeConfig{
			SecretKey:      getenv("STRIPE_SECRET_KEY"),
			WebhookSecret:  getenv("STRIPE_WEBHOOK_SECRET"),
			PublishableKey: getenv("STRIPE_PUBLISHABLE_KEY"),
		},
		Log: LogConfig{
			Level: opt("LOG_LEVEL", "info"),
		},
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("config: missing/invalid required environment variables: %s", strings.Join(missing, ", "))
	}
	return cfg, nil
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
