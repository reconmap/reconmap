---
title: Configuring database settings
parent: Admin manual
---

The database settings for the Reconmap API (NGAPI) are stored in the `appsettings.json` file. When using Docker Compose, this file is typically mapped from `config-ngapi.json` in the project root.

### Example configuration

In your `config-ngapi.json`, the database connection string should look like this:

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

```yaml
  postgres:
    image: ghcr.io/reconmap/rest-api-db:latest
    environment:
      POSTGRES_PASSWORD: reconmuppet
```

The database schema and initial data are automatically applied when the `postgres` container starts for the first time.
