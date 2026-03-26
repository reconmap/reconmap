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
    "MySqlConnection": "server=rmap-mysql;port=3306;database=reconmap;user=reconmapper;password=reconmapped;"
  }
}
```

Adjust the values (server, port, database, user, password) according to your environment.

### Docker Compose environment

If you are using the default `compose.yaml`, the MySQL service is named `rmap-mysql` and the credentials match the example above.

```yaml
  mysql:
    container_name: rmap-mysql
    image: ghcr.io/reconmap/rest-api-db:latest
    environment:
      MYSQL_ROOT_PASSWORD: reconmuppet
```

The database schema and initial data are automatically applied when the `rmap-mysql` container starts for the first time.
