# Reconmap on Kubernetes

Reconmap is deployed with the Helm chart in [`helm-charts/reconmap`](helm-charts/reconmap). It is the only supported path:
the chart carries no copy of the database schema, Keycloak realm or authorization policy, because those are baked
into the `ghcr.io/reconmap/postgres`, `ghcr.io/reconmap/keycloak` and `ghcr.io/reconmap/opa` images (the same images Docker Compose uses).

## Requirements

- Kubernetes 1.34 or greater
- Helm 3.14 or greater
- A [Gateway API](https://gateway-api.sigs.k8s.io/) implementation and a `Gateway` to expose the dashboard, API and Keycloak (optional for local trials)
- A default StorageClass (or set `*.persistence.storageClassName`)

## What gets deployed

| Component | Kind | Image |
|---|---|---|
| Dashboard | Deployment | `ghcr.io/reconmap/dashboard` |
| API | Deployment | `ghcr.io/reconmap/api` |
| Keycloak | Deployment | `ghcr.io/reconmap/keycloak` |
| OPA | Deployment | `ghcr.io/reconmap/opa` |
| PostgreSQL | StatefulSet | `ghcr.io/reconmap/postgres` |
| Redis | StatefulSet | `redis` |
| RabbitMQ | StatefulSet | `rabbitmq` |
| S3 storage (RustFS) | StatefulSet | `rustfs/rustfs` |

Every pod meets the `restricted` Pod Security Standard (non-root, seccomp `RuntimeDefault`, all capabilities dropped,
no service account token). The datastores only accept connections from the components that need them (NetworkPolicy).

## Install

```shell
cd helm-charts/reconmap
make install                      # lint, install into namespace "reconmap" and enforce the restricted PSS
```

or manually:

```shell
helm upgrade --install reconmap helm-charts/reconmap \
  --namespace reconmap --create-namespace \
  --set hosts.dashboard=reconmap.example.com \
  --set hosts.api=api.reconmap.example.com \
  --set hosts.keycloak=auth.reconmap.example.com \
  --set tls=true \
  --set gateway.enabled=true \
  --set 'gateway.parentRefs[0].name=shared-gateway' \
  --set 'gateway.parentRefs[0].namespace=gateway-system'
```

`hosts` and `tls` are the single source for every public URL: the dashboard `config.json`, Keycloak's hostname and
redirect URIs, the API's token issuer and CORS origin are all derived from them. Terminate TLS on the Gateway.

Without a Gateway, port-forward the three services (see the notes printed by `helm install`).

For plain YAML:

```shell
helm template reconmap helm-charts/reconmap --namespace reconmap > reconmap.yaml
```

## Configuration

Read `helm-charts/reconmap/values.yaml`; `values.schema.json` rejects unknown secret keys and wrong types.

- **Secrets**: all credentials live in one Secret. Unset values are generated on first install and kept on upgrade.
  To manage them externally (External Secrets Operator, Sealed Secrets, ...) set `secrets.existingSecret` to a Secret that contains
  `postgres-password`, `db-password`, `keycloak-db-password`, `redis-password`, `rabbitmq-password`,
  `keycloak-admin-password`, `admin-client-secret`, `api-client-secret` and `s3-secret-key`.
- **External datastores**: set `postgres.enabled=false` and `postgres.externalHost=...` (same for `redis`, `rabbitmq`,
  and `s3.enabled=false` with `s3.endpoint`). The database must be initialised with the schema from the `ghcr.io/reconmap/postgres` image.
- **API settings**: the API image ships its defaults in `appsettings.json`. The chart overrides only what changes per environment
  as environment variables; add more through `api.extraEnv` (for example `Storage__Uploads__MaxFileSizeBytes`).
- **Images**: Reconmap images default to the chart `appVersion`; pin with `<component>.image.tag` or `.digest`.
- **Resources**: every component has requests/limits in values.

## Operations

```shell
make get-values      # in helm-charts/reconmap
helm test reconmap -n reconmap
kubectl -n reconmap get secret reconmap-secrets -o jsonpath='{.data.keycloak-admin-password}' | base64 -d
```

Keycloak runs as a single replica; scaling it out requires distributed cache configuration. The API keeps its Data
Protection keys on a `ReadWriteOnce` volume, so it is also a single replica unless you provide a shared volume.

## Uninstall

```shell
helm uninstall reconmap -n reconmap      # PVCs from the StatefulSets are kept; delete them to drop the data
```
