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
- Database (MySQL)
- Identity Provider (Keycloak)
- Message Broker (RabbitMQ)
- Cache (Redis)
- Storage (RustFS)

### System usage

The system usage view shows you high-level statistics about your Reconmap instance.

![System usage](/images/screenshots/system-usage.png)

Go to `System -> Usage` to see:
- Total number of users, projects, and vulnerabilities.
- Database size and storage usage.
- Active sessions and recent activity.
