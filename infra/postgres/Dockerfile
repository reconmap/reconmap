FROM postgres:18.6-alpine

LABEL org.opencontainers.image.title="Reconmap PostgreSQL" \
    org.opencontainers.image.description="PostgreSQL with the Reconmap schema and default data" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/infra/postgres"

COPY initdb/ /docker-entrypoint-initdb.d/
