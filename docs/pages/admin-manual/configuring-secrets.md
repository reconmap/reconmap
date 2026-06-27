---
title: Configuring secrets
parent: Admin manual
---

Reconmap centralizes all credentials, passwords, and client secrets into a single `.env` file located at the root of the repository.

At runtime, the Docker containers automatically read these variables, completely overriding any development defaults inside the static JSON configuration files.

### Configuration Variables

The following secrets and configuration variables are defined in the `.env` file:

| Variable Name | Description |
| --- | --- |
| `MYSQL_ROOT_PASSWORD` | The root password for the MySQL database container. |
| `MYSQL_RECONMAP_USER` | The database username for the core Reconmap API. |
| `MYSQL_RECONMAP_PASSWORD` | The database password for the core Reconmap API. |
| `MYSQL_KEYCLOAK_USER` | The database username for the Keycloak Identity Provider. |
| `MYSQL_KEYCLOAK_PASSWORD` | The database password for the Keycloak Identity Provider. |
| `REDIS_PASSWORD` | The password required to authenticate with the Redis server. |
| `RABBITMQ_DEFAULT_USER` | The default user name for the RabbitMQ message broker. |
| `RABBITMQ_DEFAULT_PASS` | The default password for the RabbitMQ message broker. |
| `RUSTFS_ACCESS_KEY` | The access key ID for the RustFS (S3 compatible) file storage. |
| `RUSTFS_SECRET_KEY` | The secret access key for the RustFS (S3 compatible) file storage. |
| `KEYCLOAK_BOOTSTRAP_ADMIN_USERNAME` | The bootstrap administrator username for Keycloak setup. |
| `KEYCLOAK_BOOTSTRAP_ADMIN_PASSWORD` | The bootstrap administrator password for Keycloak setup. |
| `KEYCLOAK_ADMIN_CLIENT_SECRET` | The client secret used for Keycloak admin client authorization. |
| `KEYCLOAK_RECONMAPD_CLIENT_SECRET` | The client secret used by the Reconmap Agent (`reconmapd`). |
| `KEYCLOAK_API_CLIENT_SECRET` | The client secret used by the core Reconmap REST API client. |

### Database User Initialization

During the first container startup, a dynamic shell script (`infra/docker/mysql/initdb/00-databases.sh`) executes inside the database container to create the databases and assign permissions to the users using the passwords defined above.

### Updating or Rotating Secrets

1. Modify the values inside the `.env` file at the root of the repository.
2. Restart the Docker Compose stack to apply the new values:
   ```bash
   docker compose down
   docker compose up -d
   ```

> [!WARNING]
> If you rotate the database passwords (`MYSQL_RECONMAP_PASSWORD` or `MYSQL_KEYCLOAK_PASSWORD`), you must delete the existing database volume before restarting the stack so that they can be re-initialized:
> ```bash
> docker compose down -v
> docker compose up -d
> ```
