FROM openpolicyagent/opa:1.21.2

LABEL org.opencontainers.image.title="Reconmap OPA" \
    org.opencontainers.image.description="Open Policy Agent serving the Reconmap authorization policy" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/policy"

COPY authz.rego /policy/authz.rego

ENTRYPOINT ["/opa"]
CMD ["run", "--server", "--addr", ":8181", "--log-format=json", "/policy"]
