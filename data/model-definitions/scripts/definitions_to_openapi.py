#!/usr/bin/env python3

import argparse
from pathlib import Path

import yaml


def load_schemas(input_dir):
    schemas = {}
    for path in sorted(Path(input_dir).glob("*.yaml")):
        with path.open("r", encoding="utf-8") as f:
            schema = yaml.safe_load(f)
        if isinstance(schema, dict):
            schemas[path.stem] = schema
    return schemas


def build_openapi_document(schemas):
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Reconmap Model Definitions",
            "version": "1.0.0",
            "description": "OpenAPI schemas assembled from data/model-definitions/definitions/*.yaml",
        },
        "paths": {},
        "components": {
            "schemas": schemas,
        },
    }


def main():
    parser = argparse.ArgumentParser(
        description="Assemble OpenAPI schema files into a single OpenAPI document."
    )
    parser.add_argument("--input-dir", required=True, help="Directory containing OpenAPI schema YAML files")
    parser.add_argument("--output", required=True, help="Output OpenAPI YAML path")
    args = parser.parse_args()

    schemas = load_schemas(args.input_dir)
    document = build_openapi_document(schemas)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(document, f, sort_keys=False)


if __name__ == "__main__":
    main()