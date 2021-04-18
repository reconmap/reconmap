[![Gitter](https://badges.gitter.im/reconmap/community.svg)](https://gitter.im/reconmap/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Reconmap logo](https://pasteall.org/media/4/7/4780c30723f90cfd56ec0d056555b7e6.png)

# Reconmap

Reconmap is a vulnerability assessment and penetration testing (VAPT) platform. It helps software engineers and infosec pros collaborate on security projects, from planning, to implementation and documentation. The tool's aim is to go from recon to report in the least possible time.

## Demo

A running demo is available for you to try here: https://demo.reconmap.org

|User|Password|
|-|-|
|admin|admin123|

## Requirements

- Docker
- Docker compose
- Make

## Documentation

The API specs have been documented using the [OpenAPI](docs/openapi.yaml) specification. You can use the
interactive [OpenAPI UI](https://api.reconmap.org/docs/) to play with it.

## How to run locally

1. First you need to start your docker containers:

```sh
$ docker-compose up -d
```

2. After this, open your browser at http://localhost:3001

## How to contribute

**We are glad you are thinking about contributing to this project.** All help is hugely appreciated.

Before you jump to make any changes make sure you have read the [contributing guidelines](CONTRIBUTING.md). This would
save us all time. Thanks!

## How to report bugs or feature requests

If you have bugs or feature requests to report please use the [issues](https://github.com/reconmap/application/issues)
tab on Github.

If you want to chat to somebody on the development team head to our [Gitter](https://gitter.im/reconmap/community)
community.
