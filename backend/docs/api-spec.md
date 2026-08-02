# API Surface Inventory

Status: **high-level inventory for scoping, not a contract.** Exact request/response shapes, validation rules, and error cases are defined per-module during the deep-dive pass and formalized into `api/openapi.yaml` once implementation starts. All paths below are prefixed `/api/v1`.

Auth column: `public` (no session needed), `customer` (valid customer session), `staff`, `admin`, `webhook` (provider-signed, no user session).

## Identity — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create account, sends verification email |
| POST | `/auth/verify-email` | public | Consume verification token |
| POST | `/auth/login` | public | Create session, sets cookie |
| POST | `/auth/logout` | customer | Destroy session |
| POST | `/auth/password/forgot` | public | Send reset email |
| POST | `/auth/password/reset` | public | Consume reset token, set new password |
| GET | `/me` | customer | Current profile |
| PATCH | `/me` | customer | Update profile |
| GET | `/me/addresses` | customer | List addresses |
| POST | `/me/addresses` | customer | Add address |
| PATCH | `/me/addresses/{id}` | customer | Update address |
| DELETE | `/me/addresses/{id}` | customer | Remove address |
| GET | `/admin/users` | admin | List/search users |
| PATCH | `/admin/users/{id}/role` | admin | Change role |
| PATCH | `/admin/users/{id}/status` | admin | Activate/deactivate |

## Catalog — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/products` | public | List/filter/sort (query params: category, brand, size, color, price range, sort) |
| GET | `/products/{slug}` | public | Product detail incl. variants, media |
| GET | `/categories` | public | Category tree |
| GET | `/brands` | public | Brand list |
| GET | `/collections/{slug}` | public | Products in a curated collection |
| POST | `/admin/products` | admin | Create product |
| PATCH | `/admin/products/{id}` | admin | Update product |
| DELETE | `/admin/products/{id}` | admin | Archive product |
| POST | `/admin/products/{id}/variants` | admin | Add variant |
| PATCH | `/admin/variants/{id}` | admin | Update variant |
| POST | `/admin/products/import` | admin | Bulk CSV import |
| GET | `/admin/products/export` | admin | Bulk CSV export |
| POST | `/admin/categories` | admin | Create category |
| POST | `/admin/media` | admin/staff | Upload product image |

## Inventory — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/inventory` | staff/admin | Stock levels, low-stock filter |
| PATCH | `/admin/inventory/{variant_id}` | staff/admin | Manual stock adjustment (creates audit entry) |
| GET | `/admin/inventory/{variant_id}/history` | admin | Adjustment history |

## Cart — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/cart` | public/customer | Current cart (guest via cookie or customer) |
| POST | `/cart/items` | public/customer | Add item |
| PATCH | `/cart/items/{id}` | public/customer | Update quantity |
| DELETE | `/cart/items/{id}` | public/customer | Remove item |
| POST | `/cart/coupon` | public/customer | Apply coupon code |
| DELETE | `/cart/coupon` | public/customer | Remove coupon |

## Checkout & Orders — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/checkout/start` | customer | Validate cart, reserve stock, return checkout session |
| POST | `/checkout/shipping` | customer | Select address + shipping method, get updated totals |
| POST | `/checkout/complete` | customer | Place order, kick off payment (see Payments) |
| GET | `/orders` | customer | Order history |
| GET | `/orders/{id}` | customer | Order detail + status |
| POST | `/orders/{id}/cancel` | customer | Cancel (only while still cancellable) |
| GET | `/admin/orders` | staff/admin | Search/filter all orders |
| PATCH | `/admin/orders/{id}/status` | staff/admin | Manual status transition |
| POST | `/admin/orders/{id}/notes` | staff/admin | Internal note |

## Payments — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/payments/mpesa/initiate` | customer | Trigger STK push for an order |
| POST | `/payments/mpesa/callback` | webhook | Safaricom Daraja callback |
| POST | `/payments/stripe/intent` | customer | Create PaymentIntent for an order |
| POST | `/payments/stripe/webhook` | webhook | Stripe event delivery |
| GET | `/orders/{id}/payment-status` | customer | Poll while waiting on async confirmation |
| GET | `/admin/payments` | admin | Payment ledger, search/filter |
| POST | `/admin/payments/{id}/refund` | admin | Initiate refund |

## Shipping — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/shipping/rates` | public/customer | Quote rates for cart + destination |
| GET | `/admin/shipping/zones` | admin | Manage zones |
| POST | `/admin/shipping/zones` | admin | Create zone/rate |
| PATCH | `/admin/orders/{id}/fulfillment` | staff/admin | Set tracking number, mark shipped/delivered |

## Returns & Refunds — `P2`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/orders/{id}/returns` | customer | Request a return |
| GET | `/returns/{id}` | customer | Return status |
| GET | `/admin/returns` | staff/admin | Queue of pending returns |
| PATCH | `/admin/returns/{id}` | staff/admin | Approve/reject, trigger refund |

## Reviews — `P2`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/products/{id}/reviews` | public | List approved reviews |
| POST | `/products/{id}/reviews` | customer | Submit review (must have purchased) |
| GET | `/admin/reviews/pending` | admin | Moderation queue |
| PATCH | `/admin/reviews/{id}` | admin | Approve/reject |

## Wishlist — `P2`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/me/wishlist` | customer | List |
| POST | `/me/wishlist` | customer | Add item |
| DELETE | `/me/wishlist/{id}` | customer | Remove item |

## Analytics — `P2`/`P3`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/events` | public | Client-side event ingestion (page view, product view, etc.) |
| GET | `/admin/analytics/overview` | admin | Dashboard summary (revenue, orders, conversion) |
| GET | `/admin/analytics/products` | admin | Best/worst sellers |
| GET | `/admin/analytics/funnel` | admin | View → cart → purchase funnel |

## Search — `MVP`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/search?q=` | public | Full-text product search |

## Platform (not versioned under `/api/v1`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/healthz` | public | Liveness |
| GET | `/readyz` | public | Readiness (DB + Redis reachable) |
| GET | `/metrics` | internal only | Prometheus scrape target |

---

Every module deep-dive will turn its rows above into a full contract: request/response bodies, validation, pagination shape, rate limits, and error codes.
