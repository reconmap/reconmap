# Reconmap model definitions

This directory contains the model schemas and the tooling that generates Golang and TypeScript models from them.

## Layout

- `openapi.yaml`: the root OpenAPI document. Each entry under `components.schemas` points at one file in `definitions/`.
- `definitions/*.yaml`: one OpenAPI schema per model (for example `Asset.yaml`, `Finding.yaml`).
- `templates/`: custom OpenAPI Generator templates. They keep the output minimal: plain Go structs and plain TypeScript classes, with no constructors, getters, serializers, or attribute maps.
- `Makefile`: runs OpenAPI Generator for each language.

To add a model, create `definitions/<Name>.yaml` and add a matching `$ref` entry in `openapi.yaml`.

## Requirements

- [Docker](https://www.docker.com/) (default runner for OpenAPI Generator)
- Or a local [OpenAPI Generator CLI](https://openapi-generator.tech/docs/installation)

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

The generated code is written to `output/` (`output/golang` and `output/typescript`).
