[![Build and deployment workflow](https://github.com/reconmap/reconmap/actions/workflows/api-build-push.yml/badge.svg)](https://github.com/reconmap/reconmap/actions/workflows/api-build-push.yml)

# Reconmap API

The Reconmap API is a RESTful API that allows any of the clients (Web, CLI, Mobile) to manipulate any of the Reconmap's
entities: projects, tasks, commands, reports, users, etc. With the API you can extend Reconmap in any way you can
imagine.

This is a component of many in the [Reconmap's architecture](https://reconmap.com/development/architecture/).

## Runtime requirements

-   Docker
-   Docker compose
-   Make

## Documentation

The API specs have been documented using the **OpenAPI** specification. You can use the
interactive [OpenAPI UI](https://demo.api.reconmap.com/docs/) to play with it.

## Build instructions

The first thing you need to do is build the containers and prepare the app. This can be achieved by invoking the default
make target:

```sh
make
```

Once the containers are built, and the app prepared, you can run the docker services with the following command:

```sh
make start
```

If everything went ok you should be able to use curl or any other HTTP client (eg your browser) to call the API:

```sh
curl http://localhost:5510
```

## Startup diagnostics

At startup, the API writes a secret-safe summary of its listener URL and the database, Redis, RabbitMQ, Keycloak, and S3 endpoint hosts directly to standard error, as well as through the configured logger. This makes the bootstrap milestones visible even when production log filtering suppresses informational messages. It also reports invalid or missing connection settings before Kestrel begins listening. If startup is cancelled, the log explicitly identifies it as a host shutdown cancellation and records the API lifecycle transition. Do not paste the full configuration or environment output into support requests; redact passwords, client secrets, and access keys.

## How to contribute

**We are glad you are thinking about contributing to this project.** All help is hugely appreciated.

Before you jump to make any changes make sure you have read
the [contributing guidelines](https://github.com/reconmap/.github/blob/main/CONTRIBUTING.md). This would
save us all time. Thanks!

## How to report bugs or feature requests

If you have bugs or feature requests to report please use the [issues](https://github.com/reconmap/reconmap/issues)
tab on Github.
