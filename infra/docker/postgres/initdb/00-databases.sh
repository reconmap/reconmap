#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER "${POSTGRES_RECONMAP_USER}" WITH PASSWORD '${POSTGRES_RECONMAP_PASSWORD}';
    CREATE DATABASE reconmap OWNER "${POSTGRES_RECONMAP_USER}" ENCODING 'UTF8';
    GRANT ALL PRIVILEGES ON DATABASE reconmap TO "${POSTGRES_RECONMAP_USER}";
    ALTER DATABASE reconmap SET timezone TO 'UTC';

    CREATE USER "${POSTGRES_KEYCLOAK_USER}" WITH PASSWORD '${POSTGRES_KEYCLOAK_PASSWORD}';
    CREATE DATABASE keycloak OWNER "${POSTGRES_KEYCLOAK_USER}" ENCODING 'UTF8';
    GRANT ALL PRIVILEGES ON DATABASE keycloak TO "${POSTGRES_KEYCLOAK_USER}";
    ALTER DATABASE keycloak SET timezone TO 'UTC';
EOSQL

# Now run the schema and default-data scripts as the reconmap user on the reconmap database
PGPASSWORD="${POSTGRES_RECONMAP_PASSWORD}" psql -v ON_ERROR_STOP=1 --username "${POSTGRES_RECONMAP_USER}" --dbname "reconmap" -f /docker-entrypoint-initdb.d/sql/01-schema.sql
PGPASSWORD="${POSTGRES_RECONMAP_PASSWORD}" psql -v ON_ERROR_STOP=1 --username "${POSTGRES_RECONMAP_USER}" --dbname "reconmap" -f /docker-entrypoint-initdb.d/sql/02-default-data.sql
