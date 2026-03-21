[![Build and deployment workflow](https://github.com/reconmap/reconmap/actions/workflows/dashboard-build-push.yml/badge.svg)](https://github.com/reconmap/reconmap/actions/workflows/dashboard-build-push.yml)

# Reconmap Dashboard

The Reconmap Dashboard allows users to interact with the Reconmap API to create projects, tasks, commands, reports and much more. Other clients include the [CLI](../../cli) (command line interface).

## Requirements

- Docker
- Make
- [Reconmap API](../api)

## Running instructions

```sh
make prepare start
firefox http://localhost:5500/
```
