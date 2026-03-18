---
title: Deployment options
parent: Admin manual
---

Reconmap is composed of several microservices and client applications — including a REST API, a React dashboard, an agent, and supporting infrastructure such as MySQL, Redis, and Keycloak. Because of this architecture, there are multiple ways to deploy the platform depending on your team size, technical expertise, and infrastructure preferences.

The sections below describe each deployment option, along with its trade-offs, to help you choose the best fit for your environment.

---

### Docker Compose

**Best for:** Local development, small teams, and quick evaluations.

Docker Compose is the recommended starting point for most users. It bundles all required services into a single configuration file (`compose.yaml`) and brings everything up with one command, so there is no need to install .NET, MySQL, or any other dependency directly on your host.

**Getting started:**

```bash
docker compose up -d
```

Once all containers are healthy, the dashboard will be available on port `5500` and the API on port `3000` by default.

**Considerations:**

- Requires Docker and Docker Compose installed on the host.
- Not designed for high-availability or horizontal scaling out of the box.
- Docker Swarm can be used to extend this setup with basic multi-node orchestration if needed.

---

### Kubernetes

**Best for:** Production deployments, large teams, and publicly accessible instances.

Kubernetes provides the scalability and resilience needed for running Reconmap in production. Helm charts and raw Kubernetes resource manifests are provided in the `infra/k8s/` directory of this repository.

This option is ideal when you need:

- Horizontal scaling of individual services.
- Rolling updates with zero downtime.
- Integration with cloud-native tooling (ingress controllers, secrets managers, monitoring stacks, etc.).

More information on how to deploy Reconmap to Kubernetes, including Helm chart values and configuration examples, can be found in the [infra/k8s directory on GitHub](https://github.com/reconmap/reconmap/tree/main/infra/k8s).

**Considerations:**

- Requires a working Kubernetes cluster (self-hosted or cloud-managed).
- More operational complexity compared to Docker Compose.
- Recommended for teams already familiar with Kubernetes or running other workloads on a cluster.

---

### Manual installation

**Best for:** Advanced users who need full control over the runtime environment.

A manual installation means setting up each component — the .NET runtime, MySQL, Redis, Keycloak, Nginx, and the Reconmap services themselves — directly on an operating system of your choice. This approach is framework-agnostic and works on any Linux server or VM.

**High-level steps:**

1. Install runtime dependencies (.NET 10, MySQL 8, Redis, Keycloak).
2. Configure Nginx (or another reverse proxy) to route traffic to the API and dashboard.
3. Clone the repository and build the API and dashboard.
4. Apply the database migrations and seed data from `data/`.
5. Configure each component using the provided `config-*.json` template files.

**Considerations:**

- Provides maximum flexibility in how services are configured and deployed.
- All dependency management, upgrades, and security patching are your responsibility.
- Not recommended unless you have a specific reason to avoid containerisation.

---

### SaaS

**Best for:** Teams that want a fully managed Reconmap experience with no infrastructure to maintain.

If you would rather focus on pentesting than on platform operations, [Netfoe](https://netfoe.com) offers a hosted Reconmap service maintained by the lead developers of the project. Updates, backups, and infrastructure management are all handled for you.
