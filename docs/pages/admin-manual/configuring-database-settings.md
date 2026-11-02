---
title: Configuring database settings
parent: Admin manual
---

The database settings for the Reconmap API (NGAPI) are defaults in the `appsettings.json` shipped with the API image, which holds no passwords. With Docker Compose, the password comes from `POSTGRES_RECONMAP_PASSWORD` in `.env`; elsewhere, set `ConnectionStrings__PostgreSqlConnection`, or mount your own `appsettings.json`.

### Example configuration

In `appsettings.json` (or as the environment variable above), the database connection string should look like this:

```json
{
  "ConnectionStrings": {
    "PostgreSqlConnection": "Host=postgres;Port=5432;Database=reconmap;Username=reconmapper;Password=reconmapped;"
  }
}
```

Adjust the values (Host, Port, Database, Username, Password) according to your environment.

### Docker Compose environment

If you are using the default `compose.yaml`, the PostgreSQL service is named `postgres` and the credentials match the example above.

If you are upgrading an installation that still has PostgreSQL 17 data, follow [Upgrading PostgreSQL to 18](upgrading-postgresql.md) first.

```yaml
  postgres:
    image: postgres:18.6-alpine
    environment:
      POSTGRES_PASSWORD: reconmuppet
```

The database schema and initial data are automatically applied when the `postgres` container starts for the first time.
