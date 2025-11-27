FROM quay.io/keycloak/keycloak:26.3

LABEL org.opencontainers.image.vendor="Netfoe" \
	org.opencontainers.image.authors="Santiago Lizardo" \
	org.opencontainers.image.title="Reconmap Keycloak" \
	org.opencontainers.image.description="Custom Keycloak for Reconmap" \
	org.opencontainers.image.licenses="Apache-2.0" \
	org.opencontainers.image.url="https://github.com/reconmap/reconmap" \
	org.opencontainers.image.source="https://github.com/reconmap/keycloak-custom" \
	org.opencontainers.image.documentation="https://github.com/reconmap/documentation"

COPY reconmap-theme-keycloak.jar /opt/keycloak/providers/

COPY realm.json /opt/keycloak/data/import/reconmap-realm.json

ENV KEYCLOAK_IMPORT=/opt/keycloak/data/import/reconmap-realm.json

COPY --chmod=0755 healthcheck.sh /opt/keycloak/healthcheck.sh

HEALTHCHECK --interval=20s --timeout=10s --retries=10 CMD /opt/keycloak/healthcheck.sh
