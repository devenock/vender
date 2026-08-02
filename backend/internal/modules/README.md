# Modules

Empty on purpose. Each bounded context from [../../docs/spec.md](../../docs/spec.md) becomes a directory here **when it's implemented**, in the order set by [../../docs/roadmap.md](../../docs/roadmap.md) — not pre-scaffolded in bulk, per the convention in [../../CLAUDE.md](../../CLAUDE.md) ("start flat, don't pre-create empty folders").

Expected first: `identity` (Phase 0/1 — everything else depends on auth existing), then `catalog`, `inventory`, `cart`, `pricing`, `order`, `payment`, `shipping` to close out the Phase 1 MVP loop.

Each module directory follows the hexagonal shape from [../../docs/architecture.md](../../docs/architecture.md) §3: starts flat (`domain.go`, `service.go`, `ports.go`, `http.go`, `postgres.go`) and only grows into `domain/`, `application/`, `ports/`, `adapters/` subfolders once a single flat package gets unwieldy.
