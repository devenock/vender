# Backend Architecture

Status: **planning — no code written yet**. This document defines how the backend is built, not what it does (see [spec.md](spec.md) for scope).

## 1. Style: modular monolith, hexagonal per module

One deployable Go service (plus one background worker binary sharing the same code), organized as a set of internal modules — one per bounded context (catalog, cart, orders, payments, …). Each module is internally structured as **ports & adapters (hexagonal)**:

```mermaid
graph LR
    subgraph Module e.g. "catalog"
        H[Inbound Adapter<br/>HTTP handlers - chi] --> A[Application<br/>use cases / services]
        A --> D[Domain<br/>entities, value objects, domain rules]
        A -.implements against.-> P[Ports<br/>interfaces: Repository, Cache, EventPublisher]
        P -.implemented by.-> O1[Outbound Adapter<br/>Postgres repo]
        P -.implemented by.-> O2[Outbound Adapter<br/>Redis cache]
        P -.implemented by.-> O3[Outbound Adapter<br/>Mpesa / Stripe client]
    end
```

**Why modular monolith over microservices:** single VPS deployment target, one small team, and most modules share the same transaction boundary (an order touches inventory, pricing, and payments atomically). Microservices would add network calls, distributed transactions, and ops overhead the project doesn't need yet. The hexagonal boundaries *inside* the monolith are what let us split a module out into its own service later without rewriting its domain/application logic — only a new adapter is needed.

**Why hexagonal over a typical MVC/service-repository layout:** it keeps `domain` and `application` free of framework/infra imports (no `chi`, no `pgx`, no `stripe-go` inside business logic), which makes the core logic unit-testable without a database and swappable (e.g. Postgres → something else, Stripe → another PSP) without touching use cases.

## 2. Dependency rule

Dependencies only point inward. Outer layers know about inner layers; inner layers know nothing about outer ones.

```
cmd  →  adapters  →  application  →  domain
                 ↘   ports        ↗
```

- **domain**: entities, value objects, domain errors, pure business rules. No imports outside the standard library (and maybe `github.com/google/uuid`). Cannot import `application`, `adapters`, or any driver/SDK.
- **ports**: interfaces the application needs from the outside world (`ProductRepository`, `PaymentGateway`, `Notifier`, `Cache`, `EventPublisher`) and interfaces the outside world uses to drive the application (`ProductService`). Defined in terms of domain types only.
- **application**: use cases (e.g. `PlaceOrder`, `CapturePayment`). Depends on `domain` and `ports` only — never on a concrete adapter.
- **adapters/inbound**: HTTP handlers (chi), request/response DTOs, validation, translating HTTP ⇄ application calls. May also include the future CLI or a gRPC adapter if ever needed.
- **adapters/outbound**: Postgres repositories (via `sqlc` + `pgx`), Redis cache/session/queue clients, Mpesa/Stripe SDK wrappers, email/SMS provider clients, object storage client. Each implements a port interface.
- **cmd**: composition root. Reads config, constructs adapters, injects them into application services, wires HTTP routes, starts the server/worker. The *only* place allowed to know about every concrete type.

Enforced in code review (and later a `go vet`/lint rule) — not by the compiler alone, since Go has no package-private-to-a-subtree enforcement beyond folder-per-package. A dependency going from `domain` to `adapters` is a review blocker.

## 3. Repository layout

```
backend/
  cmd/
    api/                    # HTTP server entrypoint (main.go)
    worker/                 # background job processor entrypoint (main.go)
    migrate/                # thin wrapper to run golang-migrate from `make`
  internal/
    modules/
      identity/             # users, auth, sessions, roles
        domain/
        application/
        ports/
        adapters/
          http/
          postgres/
          redis/
      catalog/              # products, variants, categories, brands
      inventory/
      media/
      pricing/              # promotions, coupons, tax
      cart/
      order/                # checkout + order lifecycle
      payment/              # mpesa, stripe, ledger
        adapters/
          mpesa/
          stripe/
          postgres/
      shipping/
      returns/
      review/
      wishlist/
      notification/         # email/sms dispatch
      analytics/            # event ingestion + rollups
      admin/                # cross-module admin + audit log
      search/
    platform/                # shared infrastructure, not business logic
      config/                # env var loading, validation
      db/                    # pgx pool setup, tx helper
      cache/                 # redis client wrapper
      queue/                 # asynq client/server setup
      logger/                # slog setup
      httpserver/            # chi router, middleware stack, graceful shutdown
      session/               # cookie + redis-backed session middleware
      objectstorage/         # S3-compatible (MinIO) client wrapper
    pkg/                      # small reusable non-domain helpers
      apperror/               # typed application errors → HTTP status mapping
      response/                # JSON envelope helpers
      pagination/
      validation/
  migrations/                 # golang-migrate SQL files, source of truth for schema
  api/
    openapi.yaml               # generated/maintained once implementation starts
  deployments/
    docker/
      api.Dockerfile
      worker.Dockerfile
    compose/
      docker-compose.yml
      docker-compose.prod.yml
    nginx/
  scripts/
  Makefile
  go.mod
```

Each module's internal folders (`domain/`, `application/`, `ports/`, `adapters/`) are only created once that module has enough logic to warrant the split — trivial modules (e.g. `wishlist`) may start as `domain.go`, `service.go`, `ports.go`, `http.go`, `postgres.go` in a flat package and grow into subfolders if they get complex. Don't pre-create empty folders.

## 4. Cross-module communication

Modules should not import each other's `application`/`domain` packages directly when avoidable (that recreates a distributed-monolith coupling problem inside one binary). Two patterns:

1. **Synchronous, through a port**: if `order` needs to reserve stock, it depends on an `InventoryReserver` port (defined in `order/ports`), and `cmd/api` wires `inventory`'s application service as the concrete implementation at startup. `order` never imports `inventory/domain`.
2. **Asynchronous, through domain events**: most side effects (send confirmation email after order placed, record analytics event, notify low stock) are published as domain events (`OrderPlaced`, `PaymentCaptured`) to an in-process event bus for anything that can be eventually consistent, or enqueued as an `asynq` task for anything that must survive a crash (emails, SMS, webhooks retries).

Use (1) when the calling module needs a synchronous answer (e.g. "is this SKU in stock?"). Use (2) for everything that's a reaction to something that already happened.

## 5. Data access

- **sqlc** generates typed Go from hand-written SQL (`internal/modules/<module>/adapters/postgres/queries/*.sql`) — no ORM. Keeps SQL visible and reviewable, keeps the domain layer free of struct tags/ORM magic, and keeps query performance explicit.
- **pgx v5** as the driver/pool, wrapped in `platform/db` for connection pooling, health checks, and a `WithTx` helper for use cases that must be atomic across multiple repositories (e.g. placing an order = create order row + decrement stock + create payment intent record, in one transaction).
- **golang-migrate** for schema migrations, run via `make migrate-up` / `make migrate-down`, applied automatically on deploy before the new binary starts.
- One Postgres **schema per module is not used** — all modules share one database/schema for now (simplifies joins and transactions in a monolith); ownership is enforced by convention (a module's tables are only queried by that module's adapters) rather than physical schema separation. Revisit if/when a module is split into its own service.

## 6. Session & auth

- Session-based auth (per your instruction to use Redis for session management), not JWT. On login, the server creates a random opaque session ID, stores session data (user ID, role, issued-at) as a Redis hash with a sliding TTL, and sets it in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
- `platform/session` middleware resolves the cookie → Redis lookup → attaches the authenticated user to `context.Context` for handlers/use cases to read via a typed context key — never by passing `*http.Request` into the application layer.
- CSRF: since auth is cookie-based, state-changing requests require a CSRF token (double-submit cookie or `platform/session`-issued token) checked by middleware.
- Passwords hashed with **argon2id**.

## 7. Background processing

`asynq` (Redis-backed task queue) runs in `cmd/worker`, sharing `internal/modules/*/application` code with `cmd/api`. Used for: outbound email/SMS, Mpesa STK status polling, Stripe webhook side effects that shouldn't block the webhook response, nightly analytics rollups, abandoned cart reminders, low-stock alerts.

## 8. Error handling conventions

- Domain/application errors are typed (`apperror.NotFound`, `apperror.Conflict`, `apperror.Invalid("field", reason)`, `apperror.Unauthorized`, …) and carry no HTTP knowledge.
- The HTTP adapter (and only the HTTP adapter) maps `apperror` types to status codes and a consistent JSON error envelope.
- Errors are wrapped with `%w` and enough context to debug (`fmt.Errorf("catalog: get product %s: %w", id, err)`), never swallowed, never logged *and* returned (log once, at the boundary that handles it).

## 9. Testing strategy

| Layer | Tool | What's tested |
|---|---|---|
| domain | `testing` + table-driven tests | pure business rules, no mocks needed |
| application | `testing` + hand-written fakes for ports | use case orchestration, error paths |
| adapters/postgres | `testcontainers-go` (real Postgres in Docker) | queries actually work against real schema |
| adapters/http | `httptest` | routing, status codes, request validation, auth middleware |
| payment adapters | recorded fixtures / sandbox credentials | Mpesa & Stripe sandbox, no live calls in CI |

No mocking frameworks — ports are small enough that hand-written fakes are clearer and don't need maintenance-heavy generated mocks.

## 10. Configuration

All configuration via environment variables (12-factor), loaded and validated once at startup in `platform/config`, failing fast if a required var is missing. No config files, no `viper`. `.env` is for local dev only (loaded by `make run` via `godotenv` or similar, never in production — production env vars come from the deployment environment).

## 11. Observability

- Structured JSON logs via `log/slog` (stdlib, Go 1.21+), one line per request with request ID, latency, status, user ID if authenticated.
- `/healthz` (process is up) and `/readyz` (DB + Redis reachable) endpoints for the reverse proxy / uptime checks.
- `/metrics` Prometheus-format endpoint (`promhttp`) — scraping target for an optional Prometheus+Grafana pair on the same VPS, added when needed rather than day one.
- Every request gets a request ID (chi middleware), propagated into logs and returned in the response header for support/debugging.

## 12. Open decisions to confirm before implementation

These are reasonable defaults, not locked in — flag any you want changed:

- **sqlc + pgx** over an ORM (GORM/ent). Recommended for hexagonal purity and query transparency.
- **asynq** over a hand-rolled Redis queue or a heavier broker (RabbitMQ/Kafka) — Kafka/RabbitMQ is overkill for one VPS.
- **MinIO** (self-hosted, S3-compatible) for product images over an external service (S3/Cloudinary/R2) — cheapest given "existing VPS," swappable later since it's behind an `objectstorage` port.
- **Single shared Postgres database** for all modules vs. schema-per-module — recommended to keep it simple until there's a real reason to split.
- Whether `identity` supports only customer/admin roles for now, or needs a third role (e.g. support staff, warehouse staff) from day one — affects the permissions model in [spec.md](spec.md).
