FROM eclipse-temurin:21-jdk AS theme
WORKDIR /theme
COPY src/ ./
RUN jar cf /reconmap-theme-keycloak.jar .

FROM quay.io/keycloak/keycloak:26.8 AS builder
ENV KC_DB=postgres \
    KC_HEALTH_ENABLED=true
COPY --from=theme /reconmap-theme-keycloak.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.8

LABEL org.opencontainers.image.title="Reconmap Keycloak" \
    org.opencontainers.image.description="Keycloak with the Reconmap realm and login theme" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/infra/keycloak"

COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY realm.json /opt/keycloak/data/import/reconmap-realm.json
COPY --chmod=0755 healthcheck.sh /opt/keycloak/healthcheck.sh

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
