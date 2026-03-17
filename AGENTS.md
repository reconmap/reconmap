# AI Agent Guide for Reconmap

Welcome, AI Assistant! This repository is the central hub for **Reconmap**, an open-source pentesting management and automation platform.

## Repository Purpose

This is the main orchestration repository. It contains:
1. **Core Applications**: The `apps/` directory contains the main software components:
   - `api/`: The C# REST API (.NET 10).
   - `dashboard/`: The React web frontend.
2. **Deployment Configurations**: Docker Compose (`compose.yaml`) and Kubernetes resources (`infra/k8s/`).
3. **Command Line Tools**: The `cli/` directory contains Go-based tools:
   - `agent/`: The Reconmap agent (`reconmapd`).
   - `runner/`: The Reconmap runner (`rmap`).
   - `shared-lib/`: Shared Go libraries for CLI tools.
4. **Documentation**: MkDocs-based documentation in `docs/`.
5. **Data & Seed Data**: JSON templates for initial imports in `data/imports/`, model definitions in `data/model-definitions/`, and file attachments in `data/attachments/`.

## Key Architectural Concepts

- **Multi-tier**: React Frontend (dashboard), C# REST API (api), and Go CLI tools.
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

## Mandatory Feature Completion Gate

For every new feature (across `apps/`, `cli/`, `docs/`, or infra-related code), AI agents must complete all of the following before considering the task done:

1. **Run tests**
   - Execute the relevant test suite(s) for the components touched.
   - If no tests exist, add or update tests where appropriate and then run them.
   - Report test results clearly in the final response.
2. **Update documentation**
   - Update user-facing and/or developer-facing docs under `docs/` (and component `README.md` files when relevant).
   - Ensure behavior changes, new configuration, and usage examples are documented.
3. **Update `CHANGELOG.md`**
   - Add an entry for every user-visible feature addition.
   - Keep changelog entries aligned with semantic versioning expectations.

Do not mark a feature implementation as complete until all three items above are addressed (or explicitly blocked with a clear reason).
