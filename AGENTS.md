# AI Agent Guide for Reconmap

Welcome, AI Assistant! This repository is the central hub for **Reconmap**, an open-source pentesting management and automation platform.

## Repository Purpose

This is the main orchestration repository. It contains:
1. **Deployment Configurations**: Docker Compose (`compose.yaml`) and Kubernetes resources (`infra/k8s/`).
2. **Command Line Tools**: The `cli/` directory contains Go-based tools:
   - `agent/`: The Reconmap agent (`reconmapd`).
   - `runner/`: The Reconmap runner (`rmap`).
   - `shared-lib/`: Shared Go libraries for CLI tools.
3. **Documentation**: MkDocs-based documentation in `docs/`.
4. **Seed Data**: JSON templates for initial imports in `imports/`.

## Key Architectural Concepts

- **Multi-tier**: React Frontend (web-client), C# REST API (ngapi), and Go CLI tools.
- **Authentication**: Keycloak (OIDC) is used for all auth.
- **Data Persistence**: MySQL for relational data, Redis for caching.
- **Integration**: The agent connects to the API to receive tasks and execute security tools.

## Development Stack

- **CLI Tools**: Go (Golang).
- **Orchestration**: Docker Compose, Kubernetes (Helm).
- **Documentation**: MkDocs, Markdown.
- **Infrastructure**: Keycloak (customized image in `infra/docker/keycloak`).

## How to Help

- **Orchestration**: Help users configure and deploy Reconmap using Docker or K8s.
- **CLI Development**: Assist in modifying the Go CLI tools in `cli/`. Follow the existing Go patterns and use the `Makefile` in `cli/`.
- **Documentation**: Help improve or update the manuals in `docs/`.
- **Infrastructure**: Assist with Keycloak configuration or database migrations.

## Important Files

- `compose.yaml`: Primary way to run the stack locally.
- `config-*.json`: Template configuration files for different components.
- `cli/Makefile`: Build entry point for Go tools.
- `docs/mkdocs.yml`: Configuration for the documentation site.

## Conventions

- Follow Go idiomatic patterns in `cli/`.
- Maintain semantic versioning in `CHANGELOG.md`.
- Ensure all new features are documented in `docs/`.
