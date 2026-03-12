# Development Guide for Reconmap

Welcome! This guide helps you set up and contribute to the Reconmap ecosystem.

## Prerequisites

- **Go 1.22+**: Required for building CLI tools.
- **Docker & Docker Compose**: For local stack orchestration.
- **Node.js**: If you're working on the `web-client`.
- **.NET 8**: If you're working on the `rest-api` (ng-api).

## Project Structure

- `cli/`: Go CLI tools.
    - `agent/`: The `reconmapd` agent.
    - `runner/`: The `rmap` runner.
- `docs/`: Product documentation (MkDocs).
- `infra/`: Infrastructure files (K8s, Docker).
- `imports/`: Seed data for fresh installations.

## Local Stack Setup

Use Docker Compose to run the entire Reconmap stack:

```bash
docker compose up -d
```

This starts:
- `mysql`: Database.
- `redis`: Cache.
- `keycloak`: Identity Provider (8080).
- `ngapi`: C# REST API (5510).
- `web-client`: React Frontend (5500).

## CLI Development

Navigate to the `cli/` directory to manage Go-based tools:

```bash
cd cli
make build # Builds all CLI tools
```

## Documentation

We use MkDocs for our documentation. To run locally:

```bash
cd docs
pip install -r requirements.txt
mkdocs serve
```

## Contributing

1. **Fork and Clone**: Start by forking the relevant repository.
2. **Branching**: Use descriptive branch names like `feat/new-command` or `fix/auth-issue`.
3. **Tests**: Ensure your changes pass existing tests. Add new tests where applicable.
4. **Pull Requests**: Submit a PR to the main repository.

For more details, see our [Contributing Guidelines](https://github.com/reconmap/.github/blob/main/CONTRIBUTING.md).
