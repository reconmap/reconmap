# Development Guide for Reconmap

Welcome! This guide helps you set up and contribute to the Reconmap ecosystem.

## Prerequisites

- **Go 1.25+**: Required for building CLI tools.
- **Docker & Docker Compose**: For local stack orchestration.
- **Node.js 22+**: If you're working on the dashboard.
- **.NET 10**: If you're working on the API.

## Project Structure

- `apps/`: Core applications.
    - `api/`: The C# REST API (.NET 10).
    - `dashboard/`: The React web frontend.
- `cli/`: Go CLI tools.
    - `agent/`: The `reconmapd` agent.
    - `runner/`: The `rmap` runner.
    - `shared-lib/`: Common libraries for CLI tools.
- `data/`: Data-related files and seed data.
    - `imports/`: Seed data for fresh installations.
    - `model-definitions/`: Database and model definitions.
    - `attachments/`: Default location for file attachments.
- `docs/`: Product documentation (MkDocs).
- `infra/`: Infrastructure files (K8s, Docker).

## Local Stack Setup

Use Docker Compose to run the entire Reconmap stack:

```bash
docker compose up -d
```

This starts the production-grade baseline:
- `mysql`: Database.
- `redis`: Cache and key-value store.
- `rabbitmq`: Message queue for integrations and async tasks.
- `keycloak`: Identity Provider (8080).
- `ngapi`: C# REST API (5510).
- `web-client`: React Frontend (5500).

### Compose File Inheritance

To prevent configuration duplication, the sub-project compose files inherit from the root `compose.yaml` file using the Docker Compose `include` feature:

- **Root `compose.yaml`**: The production-ready baseline. It uses clean, production-grade configurations, avoids local builds (uses prebuilt registry images), and exposes no development debugging or management features.
- **`apps/api/compose.yaml`**: Used for local API development and testing. It includes the root `compose.yaml` and applies development-specific overrides:
  - Switches `rabbitmq` to `rabbitmq:4.2-management-alpine` and exposes the management port `15672`.
  - Configures a local `mysql` build context pointing to `infra/docker/mysql/Dockerfile`.
  - Configures `keycloak` in debug mode (running under the `testing` profile).
  - Enables the `rustfs` debug console on port `9001`.
  - Places `ngapi` and `web-client` under the `testing` profile to avoid host port conflicts while debugging the API on the host machine.
  - Overlays the local build context and local configuration files (`appsettings.json`) for the `ngapi` service under the `testing` profile.

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
