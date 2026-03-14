FROM mysql:9.6

LABEL org.opencontainers.image.vendor="Netfoe" \
	org.opencontainers.image.authors="Santiago Lizardo" \
	org.opencontainers.image.title="Reconmap MySQL" \
	org.opencontainers.image.description="Custom MySQL for Reconmap" \
	org.opencontainers.image.licenses="Apache-2.0" \
	org.opencontainers.image.url="https://github.com/reconmap/reconmap" \
	org.opencontainers.image.source="https://github.com/reconmap/rest-api" \
	org.opencontainers.image.documentation="https://github.com/reconmap/documentation"

ARG HOST_UID
ARG HOST_GID

RUN groupadd -g ${HOST_GID} reconmappers && \
	useradd -r -u ${HOST_UID} -g reconmappers reconmapper

COPY initdb/ /docker-entrypoint-initdb.d/
COPY overrides.cnf /etc/mysql/conf.d/overrides.cnf

USER reconmapper

