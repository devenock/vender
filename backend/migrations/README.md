# Migrations

SQL migrations, applied via `make migrate-up` (`cmd/migrate`, backed by [golang-migrate](https://github.com/golang-migrate/migrate)). Empty until the first module (`identity`) is implemented — schema is written alongside the module's deep-dive spec, not speculatively ahead of it (see [../docs/architecture.md](../docs/architecture.md) §5).

Naming convention golang-migrate expects, sequence number shared across the whole project (not per-module):

```
000001_create_users_table.up.sql
000001_create_users_table.down.sql
000002_create_addresses_table.up.sql
000002_create_addresses_table.down.sql
```

Every `.up.sql` must have a matching `.down.sql` that reverses it cleanly — `make migrate-down` is only as trustworthy as that pairing.
