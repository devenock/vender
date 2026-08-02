# CLAUDE.md — backend

Guidance for whoever (human or AI) works in this directory next.

## Current status

**Scaffold exists. No business modules exist yet.** What's built so far is the foundation everything else plugs into:

- `go.mod` (`github.com/devenock/vender/backend`), dependencies fetched (chi, pgx, go-redis, asynq, golang-migrate, minio-go, go-playground/validator).
- `cmd/api`, `cmd/worker`, `cmd/migrate` — real entrypoints that build and run, wired to config/logger/db/redis, but register no module routes or job handlers yet.
- `internal/platform/*` — working implementations: `config` (env loading/validation), `logger` (slog JSON), `db` (pgx pool + `WithTx`), `cache` (Redis client), `session` (Redis-backed sessions + cookie helpers + chi middleware), `queue` (asynq client/server), `objectstorage` (MinIO wrapper), `httpserver` (chi router, middleware stack, `/healthz`, `/readyz`, graceful shutdown).
- `internal/pkg/*` — `apperror` (typed errors + HTTP status mapping), `response` (JSON envelope), `pagination`, `validation`.
- `internal/modules/` — intentionally empty (see its README) — this is what "start with modules" means next.
- `migrations/` — intentionally empty, same reason.
- `deployments/` — `docker/{api,worker}.Dockerfile`, `compose/{docker-compose.yml,docker-compose.prod.yml}`, `nginx/nginx.conf`. Dev compose validated with `docker compose config`; a live `docker build`/`up` smoke test has **not** been run in this environment (no Docker daemon available) — verify it once you have one before relying on it.
- `Makefile`, `.env.example`, `.golangci.yml`, `.dockerignore` at the backend root.
- `docs/` — the six planning docs (moved here from the backend root so only `README.md` and this file live at top level).

`go build ./...`, `go vet ./...`, `gofmt`, and `golangci-lint run ./...` all pass clean as of this scaffold. Verify they still do before adding a module — a broken foundation is expensive to build on top of.

Read the docs in this order: [docs/spec.md](docs/spec.md) → [docs/architecture.md](docs/architecture.md) → [docs/data-model.md](docs/data-model.md) → [docs/api-spec.md](docs/api-spec.md) → [docs/system-design.md](docs/system-design.md) → [docs/roadmap.md](docs/roadmap.md).

**Do not start a module until told which one.** Per docs/roadmap.md, `identity` is next in priority (everything else depends on auth existing), but confirm before starting — the project owner reviews each module's scope before code is written for it. If you're reading this in a future session and modules *do* exist, this section is stale — trust the code and git history over this paragraph, and update it.

## Tech stack

| Concern | Choice |
|---|---|
| Language | Go (module declares 1.25 — pulled in by pgx/v5; `go` with `GOTOOLCHAIN=auto` fetches it automatically) |
| HTTP router | chi (v5) |
| Database | PostgreSQL |
| DB access | pgx v5 + sqlc (no ORM) — sqlc not wired in yet; first module introduces it |
| Cache / sessions / queue | Redis |
| Background jobs | asynq |
| Migrations | golang-migrate, run via `cmd/migrate` |
| Object storage | MinIO (S3-compatible, self-hosted) |
| Payments | M-Pesa (Daraja API), Stripe |
| Containerization | Docker + docker-compose |
| Deployment target | existing VPS (single host) |
| Architecture style | modular monolith, hexagonal (ports & adapters) per module |

Full rationale in [docs/architecture.md](docs/architecture.md) §12.

## Repo layout

```
backend/
  cmd/{api,worker,migrate}/main.go   entrypoints — composition roots only
  internal/
    modules/        empty — one hexagonal module per bounded context, added per docs/roadmap.md
    platform/        config, db, cache, session, queue, objectstorage, logger, httpserver
    pkg/              apperror, response, pagination, validation
  migrations/        empty — golang-migrate SQL files, added alongside each module
  api/openapi.yaml   stub — filled in per-endpoint as modules ship
  deployments/       Dockerfiles, docker-compose (dev + prod), nginx.conf
  docs/              spec, architecture, data-model, api-spec, system-design, roadmap
  Makefile
  .env.example
```

Full rationale in [docs/architecture.md](docs/architecture.md) §3.

## Working conventions

- **Dependency rule is non-negotiable**: `domain` imports nothing project-specific; `application` imports `domain`+`ports` only; `adapters` implement `ports` and may import `application`/`domain`; `cmd` is the only place that wires concrete adapters together. `internal/platform/*` is itself infrastructure — modules depend on it, it never depends on a module.
- **Money is integer minor units, never floats.** `int64` cents/lowest-KES-unit, always paired with a currency code.
- **Orders are immutable once placed.** Never join to live `product`/`product_variant` rows to render an existing order — use the snapshot fields on `order_item`.
- **All payment-initiating endpoints and all webhook handlers are idempotent.** Both Safaricom and Stripe redeliver; duplicate processing must be a safe no-op, not a double-charge or duplicate order.
- **Mutations that touch money or stock happen inside one DB transaction** — `internal/platform/db.WithTx`, never sequential unguarded writes.
- **Errors**: typed `apperror.Error` values (`apperror.NotFound(...)`, `.Conflict(...)`, `.NewInvalid(fields)`, `.Unauthorized(...)`, `.Internal(err)`), wrapped with `%w` and context at each layer. `internal/pkg/response.Error` is the only place that maps them to an HTTP status/JSON body. Log once, at the boundary that handles it — never log-and-rethrow.
- **No hand-written SQL string concatenation** — queries live in `.sql` files under a module's `adapters/postgres/queries/`, compiled by `sqlc` (introduced with the first module that needs real queries).
- **Context first, always**: every function that can block takes `context.Context` as its first parameter and respects cancellation.
- **Tests are table-driven**, hand-written fakes for ports (no mocking framework) — see [docs/architecture.md](docs/architecture.md) §9 for what's tested at which layer.
- **Config is env vars only** (`internal/platform/config`), validated at startup, fails fast listing every missing var at once. No config files, no viper. `.env` is for local dev only (loaded by Makefile targets), never committed.
- **`errcheck`/`staticcheck` findings are fixed, not suppressed** — e.g. every `Close()`/`Ping()` error is handled or explicitly discarded with `_ =` and a reason, not left unchecked. `golangci-lint run ./...` must stay clean.

## Adding a new module — checklist

1. Start flat (`domain.go`, `service.go`, `ports.go`, `http.go`, `postgres.go` in one package) unless it's obviously going to be large (catalog, order, payment) — don't pre-create empty subfolders.
2. Define `ports` in terms of `domain` types before writing any adapter.
3. Write the application-layer use case against the port interfaces, with a fake implementation, before wiring the real Postgres/Redis adapter.
4. Wire the concrete adapter and route registration in `cmd/api/main.go` (or register task handlers on the `asynq.ServeMux` in `cmd/worker/main.go`) — those are the only files allowed to know both the interface and the concrete type.
5. Migration for any new tables goes in `migrations/`, reviewed alongside the module's deep-dive spec, applied via `make migrate-up`.
6. Run `make lint test` before considering the module done.

## Makefile

Targets exist — run `make help` for the full annotated list. Common ones: `make docker-up` (postgres/redis/minio via dev compose), `make migrate-up`/`migrate-down`/`migrate-version`, `make run` (api), `make worker`, `make test`/`test-integration`, `make lint`, `make fmt`, `make build`, `make deploy` (VPS, prod compose).

## Relationship to `frontend/`

`frontend/` (sibling directory) is the existing React/TypeScript storefront, currently reading from a static `products.json` and calling a misconfigured `NEXT_PUBLIC_*` env var (CRA only inlines `REACT_APP_*` — see the earlier codebase review) instead of any real backend. Wiring the frontend to this backend, fixing that env mismatch, and replacing the direct-`axios`-to-static-JSON pattern with real API calls is Phase 1 work per [docs/roadmap.md](docs/roadmap.md) — not something to fix opportunistically from inside `backend/` work.
