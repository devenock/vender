# Delivery Roadmap

Status: **planning.** Phases exist to keep implementation from starting as "build everything at once." Each phase should be reviewed/adjusted, not treated as fixed once written. Module phase tags here match [spec.md](spec.md) and [api-spec.md](api-spec.md).

## Phase 0 — Foundations (no customer-visible features)

Goal: a deployable skeleton everything else builds on.

- Repo scaffold matching architecture.md's layout, `go.mod`, Makefile, Dockerfiles, docker-compose (dev + prod).
- `platform/*`: config loading, Postgres pool, Redis client, logger, chi router + middleware stack, session middleware skeleton.
- `/healthz`, `/readyz` endpoints.
- CI pipeline: lint, test, build.
- First migration + `identity` module: register/login/logout/session only (no email verification yet) — enough to prove the whole stack end-to-end (HTTP → application → Postgres/Redis → response).
- **Exit criteria**: can register a user, log in, hit an authenticated endpoint, deploy the whole stack to the VPS via `docker compose up`.

## Phase 1 — MVP commerce loop

Goal: a customer can browse, buy, and pay; an admin can manage what's sold and fulfill orders. This is the smallest end-to-end store.

- `identity`: full MVP scope (email verification, password reset, address book).
- `catalog`: products, variants, categories, brands, media upload — admin CRUD + public read.
- `inventory`: stock tracking + checkout-time reservation.
- `cart`: guest + authenticated, merge on login.
- `pricing`: base/sale price, coupons (promotions engine can start simple — percentage/fixed only).
- `checkout & order`: full flow, order lifecycle state machine, immutable order snapshots.
- `payment`: M-Pesa STK push + callback + fallback poll job, Stripe PaymentIntents + webhook, payment ledger.
- `shipping`: zones/rates (manual, no courier API yet), manual tracking number entry.
- `notification`: transactional email/SMS only.
- `search`: basic filter/sort/Postgres full-text search.
- `admin`: order management, product management, audit log foundation.
- **Exit criteria**: a real customer can complete a purchase with either payment method and receive their order; an admin can fulfill it end to end. This is the point where the existing frontend gets fully wired to a real backend instead of `products.json`.

## Phase 2 — Post-purchase & engagement

Goal: reduce support burden and increase repeat purchases — the features that matter once there's real order volume.

- `returns`: full RMA workflow tied into `payment` refunds.
- `review`: verified-purchase reviews + photo upload + moderation.
- `wishlist`.
- `notification`: marketing sends (abandoned cart, back-in-stock), preference management.
- `pricing`: promotions beyond flat coupons (tiered, loyalty groundwork).
- `analytics`: event ingestion + basic admin dashboard (revenue, top products, funnel).
- `identity`: 2FA for staff/admin, social login.
- **Exit criteria**: a customer can return an item and get refunded without a manual support intervention; admin has visibility into store performance without querying the database directly.

## Phase 3 — Growth & optimization

Goal: features that compound value once the core loop and post-purchase experience are solid.

- `analytics`: cohort/retention, campaign attribution, recommendation signals.
- `search`: dedicated search engine (Meilisearch/Typesense) if catalog size/relevance needs outgrow Postgres FTS.
- `shipping`: live courier API integration for rates/tracking.
- `catalog`: bundles, cross-sell/related products, size-chart-driven fit recommendations.
- `payment`: saved cards, wallet/store credit.
- Horizontal scaling groundwork per system-design.md §12, if/when traffic warrants it.

## Sequencing notes

- **Payments and inventory correctness gate everything else** — Phase 1 doesn't move to Phase 2 features until checkout, both payment providers, and stock accuracy are solid under real usage, since bugs there cost real money and customer trust.
- **The admin back-office is built alongside its module, not after** — e.g. product admin CRUD ships with `catalog` in Phase 1, not bolted on later, since there's no way to run the store without it.
- **Analytics is deliberately Phase 2, not Phase 1** — it has no dependents (nothing else in the system needs analytics data to function), so it's the right thing to defer if Phase 1 needs more time, without weakening the core store.

## What this roadmap does not decide

Exact timeboxes/dates — that depends on team size and hours available, which isn't something to guess here. This orders *what before what*, not *by when*.
