# Fashion Store — Backend

Go backend for the storefront in `../frontend`. **Scaffold + platform layer exist; no business modules yet** — see [CLAUDE.md](CLAUDE.md) for exactly what's built so far.

Planning docs live in [`docs/`](docs/), read in this order:

1. [docs/spec.md](docs/spec.md) — what it does (functional scope, module by module).
2. [docs/architecture.md](docs/architecture.md) — how it's built (hexagonal, modular monolith, repo layout).
3. [docs/data-model.md](docs/data-model.md) — core entities and relationships.
4. [docs/api-spec.md](docs/api-spec.md) — endpoint inventory.
5. [docs/system-design.md](docs/system-design.md) — how it runs in production (VPS topology, request flows, caching, security).
6. [docs/roadmap.md](docs/roadmap.md) — delivery order.
7. [CLAUDE.md](CLAUDE.md) — working conventions for whoever writes the code.

Stack: Go, chi, PostgreSQL, Redis, Docker, deployed to a single VPS. Payments via M-Pesa and Stripe.

## Layout

```
backend/
  cmd/            entrypoints: api, worker, migrate
  internal/
    modules/      one hexagonal module per bounded context, added per docs/roadmap.md
    platform/     shared infra: config, db, cache, queue, logger, httpserver, session, objectstorage
    pkg/          small framework-free helpers: apperror, response, pagination, validation
  migrations/     golang-migrate SQL files
  api/            openapi.yaml
  deployments/    Dockerfiles, docker-compose, nginx
  docs/           planning docs (this list)
  Makefile
```

## Local development

```
make docker-up     # postgres, redis, minio
make migrate-up    # apply migrations
make run           # api server
make worker        # background worker (separate terminal)
make test
```

See the [Makefile](Makefile) for the full target list and [.env.example](.env.example) for required configuration.
