# Reconmap model definitions

This directory contains the model definitions and generation tooling used to produce Golang and Typescript models for Reconmap clients.

Code generation is based only on the model definition files in `definitions/*.yaml`.
The Makefile first converts those files into a local OpenAPI document (`output/openapi-models.yaml`) and then runs OpenAPI Generator for each language.
The OpenAPI Generator step uses repository-owned custom templates so the output stays minimal: plain Go structs and plain TypeScript classes, with no constructors, getters, serializers, or attribute maps.

## Requirements

- [Docker](https://www.docker.com/) (default runner for OpenAPI Generator)
- Or a local [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation)
- [Python 3](https://www.python.org/) with `pyyaml` (used to convert model YAML files into OpenAPI)

## Usage

```sh
make
# or
make go-files
make ts-files

# use local binary instead of Docker
make go-files OPENAPI_GENERATOR=openapi-generator-cli

# use a custom output directory
make all OUTPUT_DIR=output-test
```
