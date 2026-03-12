[![Build and Deploy](https://github.com/reconmap/keycloak-custom/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/reconmap/keycloak-custom/actions/workflows/build-deploy.yml)

# Reconmap custom Keycloak

Keycloak image customised for Reconmap setups.

![Reconmap themed login screen](screenshot.png)

## Requirements

- [Make](https://www.gnu.org/software/make/)
- [Jar](https://docs.oracle.com/javase/tutorial/deployment/jar/index.html)

## Build instructions

```shell
make
```

## Run instructions

Run as any regular container passing these environment variables:

- `VAR_WEB_CLIENT_URL`: URL of the Reconmap Web client. Something like https://demo.reconmap.com
- `VAR_ADMIN_CLI_SECRET`: This is the secret needed to communicate the Reconmap REST API with the Keycloak server.
- `VAR_API_CLI_SECRET`: This is the secret needed to communicate the Reconmap REST API with the Keycloak server.
- `VAR_RECONMAPD_CLI_SECRET`: This is the secret needed to communicate the Reconmap REST API with the Keycloak server.

## References

- https://github.com/keycloak/keycloak/tree/main/docs/documentation
- https://www.keycloak.org/docs/latest/server_development/#deploying-themes
- [FreeMarker Java Template Engine](https://freemarker.apache.org/)
- https://github.com/keycloak/keycloak/tree/main/themes

