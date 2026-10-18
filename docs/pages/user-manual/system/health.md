---
title: System health
parent: System
grand_parent: User manual
---

The **system health** view shows the status of all Reconmap services and their dependencies.

![System health](/images/screenshots/system-health.png)

This view provides information about:

- API connectivity.
- Database status.
- Keycloak (identity provider) availability.
- RabbitMQ (message broker) status.
- Redis (cache) status.
- Storage availability.
- MCP server status (shown as "Not configured" when the administrator has not set `Mcp:HealthUrl`).

Services that are checked directly (database, Redis, message queue and MCP) also show their response time in milliseconds.

If any of these services are down, certain application features might not work as expected.
