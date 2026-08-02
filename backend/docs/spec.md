# Functional Specification — Fashion Store Backend

Status: **planning — scope for review, not yet detailed per-module.** This is the breadth pass across every module a full-featured fashion e-commerce platform needs. Each module gets a deep-dive spec (entities, exact API contracts, edge cases) in its own follow-up doc once you've reviewed and adjusted this scope. Phase tags (`MVP` / `P2` / `P3`) point to [roadmap.md](roadmap.md).

## Assumptions (flag anything wrong)

- **Single-tenant, single-brand store** — one fashion retailer selling its own catalog, not a multi-vendor marketplace. No seller onboarding, seller payouts, or per-vendor commission logic in this scope.
- **Markets**: Kenya (M-Pesa, KES, local delivery) + international (Stripe, USD/other, international shipping). Tax model assumes Kenyan VAT initially; multi-country tax rules are a P3 concern.
- **Roles**: `customer`, `admin`, and `staff` (limited back-office access, e.g. fulfilling orders without full admin rights). Add more roles later if you need warehouse-only or support-only accounts.
- **Channels**: web storefront (the existing React app) + admin back-office (new, not yet built on the frontend). No native mobile app yet, but the API is channel-agnostic so one could consume it later.

---

## 1. Identity & Access — `MVP`

**Purpose**: authentication, authorization, account management.

- Email/password registration with email verification (link/token, expires).
- Login/logout, session-based (Redis-backed, see architecture.md §6).
- Password reset via emailed one-time token.
- Role-based access control: `customer`, `staff`, `admin`. Route-level and use-case-level authorization checks (not just hiding UI).
- Profile management: name, phone (needed for M-Pesa + delivery), default addresses.
- Address book: multiple shipping/billing addresses per customer, one marked default.
- Account deactivation (soft delete, retains order history for records/compliance).
- `P2`: social login (Google), 2FA for admin/staff accounts, phone-number OTP login option (common in Kenyan market).

## 2. Catalog — `MVP`

**Purpose**: the product data every other module reads.

- Products with: title, description, brand, base category, status (draft/published/archived), SEO slug.
- **Variants** (critical for fashion): each product has one or more variants defined by attribute combinations — size (XS–XXL or numeric), color, sometimes material. Each variant has its own SKU, price override (optional), and stock (via `inventory` module).
- Categories: hierarchical (e.g. Women > Dresses > Evening Wear), a product can belong to multiple categories.
- Collections: curated, manually or rule-based groupings (e.g. "Summer 2026", "New Arrivals") independent of the category tree — used for merchandising on the storefront.
- Brands.
- Attributes: extensible key/value system for size, color, material, fit, occasion, season (matches the filter components already sketched in the frontend).
- Size charts per category/brand (customers can check fit before buying — a common fashion-specific need).
- Product media handled by the `media` module, referenced here.
- `P2`: product bundles/sets ("shop the look"), related/cross-sell products, back-in-stock notifications tie-in.

## 3. Inventory — `MVP`

**Purpose**: know what's sellable, prevent overselling.

- Stock quantity per variant (single warehouse/location to start).
- **Reservation on checkout start**: stock is soft-reserved when a customer begins checkout and released if payment isn't completed within a timeout (prevents two customers both "buying" the last size M in a flash sale).
- Stock decrement is atomic with order confirmation (same DB transaction).
- Low-stock threshold + admin alert (via `notification`).
- Stock adjustment log (manual admin corrections, restocks) for audit purposes.
- `P2`: multi-warehouse/location support, backorders (allow purchase with expected restock date).

## 4. Media — `MVP`

**Purpose**: product images/videos, stored via the `objectstorage` port (MinIO by default, see architecture.md).

- Upload, associate with product/variant, ordering (primary image + gallery), alt text for accessibility/SEO.
- Image variants/thumbnails generated on upload (or on read, cached) for storefront performance.
- `P2`: short product videos, 360° view images.

## 5. Pricing & Promotions — `MVP` (basic), `P2` (advanced)

**Purpose**: what the customer pays.

- Base price per variant, currency-aware (KES primary, others for Stripe customers — either multi-currency pricing or a conversion rate applied at checkout; needs a decision during deep-dive).
- Sale price with optional start/end dates (flash sales, seasonal sales — matches "ProductsOnSale"/"Deals" sections already in the frontend).
- Coupon codes: percentage or fixed discount, usage limits (total + per-customer), minimum order value, expiry.
- Tax calculation (Kenyan VAT at MVP; pluggable for other jurisdictions later).
- `P2`: tiered/bulk pricing, loyalty points redemption, gift cards/store credit.

## 6. Cart — `MVP`

**Purpose**: pre-checkout basket.

- Guest cart (Redis-backed, keyed by an anonymous session ID) and authenticated cart (persisted in Postgres) — merged when a guest logs in or registers mid-session.
- Add/update/remove line item (product variant + quantity), automatic price/stock re-validation on each mutation and on checkout start (prices/stock can change between add-to-cart and purchase).
- Cart totals: subtotal, applied discount, estimated tax, estimated shipping (once address is known).
- `P2`: saved-for-later items, abandoned cart reminder emails (via `notification` + scheduled job).

## 7. Checkout & Orders — `MVP`

**Purpose**: turn a cart into a paid, fulfillable order.

- Checkout flow: address selection/entry → shipping method → payment method (M-Pesa or Stripe) → review → place order.
- Order lifecycle (state machine): `pending_payment → paid → processing → shipped → delivered`, with `cancelled` and `refunded` as terminal side-branches. Every transition is logged (who/what/when) for support and audit.
- Order is an immutable snapshot at time of purchase (price, tax, shipping cost, product title/image) — later catalog/price changes must never alter past orders.
- Order confirmation email/SMS on payment success.
- Customer-facing order history + order detail + tracking status.
- Admin: view/search orders, manually transition status, add internal notes, cancel with reason.
- `P2`: partial fulfillment (split shipments), order editing before fulfillment (address/item changes within a grace window).

## 8. Payments — `MVP`

**Purpose**: collect money via M-Pesa and Stripe, reconcile reliably. This is the module needing the most care — full deep-dive spec comes next, this is scope only.

- **M-Pesa (Daraja API)**: STK Push (Lipa Na M-Pesa Online) as the primary flow — customer enters phone number, receives a prompt, confirms on their phone. Backend must:
  - Initiate STK push, store a pending transaction.
  - Handle the asynchronous callback from Safaricom (webhook) to confirm success/failure — callbacks are not always timely/reliable, so a **fallback status-query job** (via `asynq`) polls Daraja's transaction status API if no callback arrives within a threshold.
  - Handle C2B/paybill reconciliation if a till/paybill number is used outside STK push (edge case, likely P2).
  - `P2`: B2C for refunds paid back to M-Pesa.
- **Stripe**: PaymentIntents for card payments (supports 3D Secure), webhook-driven confirmation (`payment_intent.succeeded`, `.payment_failed`), refunds via Stripe API.
- **Common payment ledger**: every attempt (not just successes) recorded — amount, currency, provider, provider reference, status, raw provider payload (for audits/disputes) — independent of the `order` it's tied to, so reconciliation reports don't require joining through orders.
- **Idempotency**: all payment-initiating endpoints and all webhook handlers are idempotent (safe against duplicate webhook delivery, which both Safaricom and Stripe do in practice).
- **Webhook signature verification**: mandatory for Stripe (`Stripe-Signature` header); Daraja doesn't sign callbacks the same way, so IP/shared-secret validation + the fallback status-query job compensate.
- Refund initiation (admin-triggered, tied to `returns` module) for both providers.
- Currency handling: M-Pesa is KES-only; Stripe path used for other currencies — checkout must pick the right provider based on the customer's currency/market.
- `P2`: saved cards (Stripe Customer + PaymentMethod) for repeat customers, split payments, wallet/store-credit as a payment method.

## 9. Shipping & Fulfillment — `MVP`

**Purpose**: get the order to the customer.

- Shipping methods/zones with flat or weight-based rates (e.g. Nairobi same-day, rest-of-Kenya courier, international).
- Rate shown at checkout based on cart weight/destination.
- Fulfillment status independent from payment status (an order can be `paid` and `processing` simultaneously).
- Tracking number entry (admin) + customer-visible tracking status.
- `P2`: courier API integration (e.g. Sendy, G4S, or a local Kenyan courier aggregator) for live rate quotes and tracking instead of manual entry.

## 10. Returns & Refunds (RMA) — `P2`

**Purpose**: fashion has a high return rate (fit/color issues) — this matters more here than in most verticals.

- Customer-initiated return request against a delivered order (reason code: wrong size, damaged, not as described, changed mind), within a configurable return window.
- Admin approval/rejection workflow, return shipping instructions.
- Refund processed through the original payment method via the `payment` module once the returned item is received/inspected (or immediately for store-credit exchanges).
- Exchange-for-different-size/color as an alternative to refund.

## 11. Reviews & Ratings — `P2`

- Star rating + written review, tied to a verified purchase (only customers who bought the product can review it).
- Optional photo upload with review (fashion buyers rely heavily on customer photos for fit/color accuracy).
- Admin moderation queue (approve/reject/flag).
- Aggregate rating shown on product listing/detail (cached, recalculated on new review).

## 12. Wishlist — `P2`

- Save products/variants for later, per authenticated customer.
- Move wishlist item to cart.
- `P3`: notify customer when a wishlisted item goes on sale or is back in stock (ties into `inventory` + `notification`).

## 13. Notifications — `MVP` (transactional), `P2` (marketing)

**Purpose**: email/SMS delivery for every other module's events.

- Transactional: email verification, password reset, order confirmation, payment receipt, shipping update, low-stock admin alert.
- Provider-agnostic via a `Notifier` port — SMTP-based email provider to start (e.g. Postmark/SES/Resend, decide during deep-dive) and Africa's Talking (or similar) for SMS given the Kenyan market and M-Pesa's SMS-centric UX expectations.
- Templated messages (module publishes an event → notification module renders + sends), delivered via background job so a slow provider never blocks the request that triggered it.
- `P2`: marketing emails (newsletters, abandoned cart, back-in-stock), customer notification preferences/opt-out.

## 14. Analytics & Tracking — `P2` (basic), `P3` (advanced)

**Purpose**: understand what's happening on the store — the module the frontend has no equivalent of at all today.

- Event ingestion endpoint for storefront events: page view, product view, add-to-cart, checkout started, purchase completed, search query. Stored as raw events (Postgres to start; revisit a columnar store only if volume demands it).
- Server-side events (more reliable than client-only tracking): order placed, payment succeeded/failed, refund issued — captured directly from the modules that already know about them, not re-inferred from client pings.
- Nightly rollup jobs (via `asynq`) aggregating: daily/weekly revenue, top products, conversion funnel (view → cart → purchase), cart abandonment rate.
- Admin dashboard data API: revenue over time, best sellers, low performers, traffic by category, order status breakdown.
- `P3`: cohort/retention analysis, UTM/campaign attribution, product recommendation signals feeding a "customers also bought" feature.

## 15. Admin / Back-office — `MVP`

**Purpose**: everything staff/admin need day-to-day. Not a separate "module" so much as an admin-facing API surface across all the above, plus:

- Audit log: every state-changing admin action (who, what, when, before/after where practical) — required once money and inventory are involved.
- Dashboard home (pulls from `analytics`).
- User/role management (promote to staff/admin, deactivate accounts).
- Bulk product import/export (CSV) — fashion catalogs are large and change seasonally; doing this one-by-one via UI doesn't scale.

## 16. Search & Discovery — `MVP` (basic), `P3` (advanced)

- Filter by category, brand, size, color, price range, attributes (matches the sidebar filter components already present, currently unwired, in the frontend).
- Sort by price, newest, popularity, rating.
- Text search over product title/description — Postgres full-text search (`tsvector`) to start; the search port is abstracted so it can be swapped for Meilisearch/Typesense later without touching callers, if catalog size or relevance needs outgrow Postgres FTS.
- `P3`: typo-tolerant/fuzzy search, personalized ranking, "customers also viewed."

---

## Cross-cutting non-functional requirements

- **Security**: argon2id password hashing, HTTPS-only cookies, CSRF protection on state-changing endpoints, rate limiting on auth and payment-initiation endpoints, input validation on every inbound DTO, least-privilege DB credentials, secrets never committed (env vars only).
- **Auditability**: payment ledger and admin audit log are append-only; order status changes are logged, not overwritten.
- **Data correctness over cleverness**: orders are immutable snapshots, money amounts are integers (minor units — cents/lowest KES unit) not floats, all monetary/inventory mutations happen inside DB transactions.
- **Availability target**: single-VPS deployment — no multi-region HA at this stage; the target is a well-monitored single instance with backups and a documented recovery process (see system-design.md).
- **Internationalization**: KES + at least one other currency (USD via Stripe) from day one; full i18n (translated content) is out of scope unless you tell me otherwise.

## Explicitly out of scope (for now)

- Multi-vendor marketplace features (seller onboarding, payouts, commission).
- Native mobile apps (API is channel-agnostic, so this doesn't block a future app).
- Subscriptions/recurring billing.
- Physical point-of-sale (in-store checkout) integration.

---

Next step per your instruction: pick a module from this list and we go deep — exact entities/fields, API contracts, state machines, and edge cases — before any code is written.
