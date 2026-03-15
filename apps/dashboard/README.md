[![Build and deployment workflow](https://github.com/reconmap/web-client/actions/workflows/build-deployment.yml/badge.svg)](https://github.com/reconmap/web-client/actions/workflows/build-deployment.yml)

# Reconmap Web client

The Reconmap Web client allows users to interact with the Reconmap API to create projects, tasks, commands, reports and much more. Other clients include the [CLI](https://github.com/reconmap/cli) (command line interface) and the [mobile client](https://github.com/reconmap/web-client).

This is a component of many in the [Reconmap's architecture](https://docs.reconmap.com/development/architecture.html).

## Requirements

- Docker
- Make
- [Reconmap REST API](https://github.com/reconmap/rest-api)

## Running instructions

```sh
make prepare start
firefox http://localhost:5500/
```
