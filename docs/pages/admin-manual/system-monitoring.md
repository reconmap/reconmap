---
title: System monitoring
parent: Admin manual
---

Reconmap provides built-in tools for monitoring the health and usage of your instance directly from the dashboard.

### System health

The system health view provides real-time status of all the platform's microservices and dependencies.

![System health](/images/screenshots/system-health.png)

Go to `System -> Health` to see the status of:
- API connectivity
- Database (PostgreSQL)
- Identity Provider (Keycloak)
- Message Broker (RabbitMQ)
- Cache (Redis)
- Storage (RustFS)
- MCP server

The same information is shown by the **System health** dashboard widget, which links to this view.

The REST API checks the MCP server by calling the URL in the `Mcp:HealthUrl` setting (environment variable `Mcp__HealthUrl`; Docker Compose sets it from `MCP_HEALTH_URL`, defaulting to `http://mcp:5520/health`). If the setting is empty, the MCP server is reported as "Not configured". A probe times out after 2 seconds.

### System usage

The system usage view shows you high-level statistics about your Reconmap instance.

![System usage](/images/screenshots/system-usage.png)

Go to `System -> Usage` to see:
- Total number of users, projects, and vulnerabilities.
- Database size and storage usage.
- Active sessions and recent activity.
