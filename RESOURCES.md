# Project Resources

A directory of important files and folders in the Reconmap repository.

## Core Deployment

- `compose.yaml`: Docker Compose file for the full local stack.
- `.env`: Environment variables (not tracked in Git, template in README).
- `infra/`:
    - `docker/`: Custom Dockerfiles (e.g., Keycloak).
    - `k8s/`: Kubernetes manifests and Helm charts.

## Configuration Templates

- `config-agent.json`: Template for the `reconmapd` agent.
- `config-cli.json`: Template for the `rmap` runner.
- `config-ngapi.json`: Template for the `ng-api` (C# REST API).
- `config-ui.json`: Template for the React web client.

## Command Line Tools (`cli/`)

- `cli/agent/`: The `reconmapd` daemon (Go).
- `cli/runner/`: The `rmap` command line tool (Go).
- `cli/shared-lib/`: Common Go libraries.
- `cli/Makefile`: Build script for Go components.

## Documentation & Data

- `docs/`: Markdown files for user and developer manuals.
- `imports/`: JSON seed data for initial setup (commands, project templates).
- `data/`: Storage for attachments and cache.

## Metadata & Guidelines

- `README.md`: High-level project information.
- `CHANGELOG.md`: Version history and updates.
- `AGENTS.md`: Guide for AI assistants.
- `DEVELOPMENT.md`: Setup guide for developers.
- `LICENSE`: Apache 2.0 license.
