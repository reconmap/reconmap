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

The page is organised in tabs: **AI usage**, **Storage**, **Infrastructure** (key-value server and message queues) and **Client cache**.

The system usage view shows what your instance consumes: LLM tokens and estimated cost, storage, the key-value server and the message queues.

![System usage](/images/screenshots/system-usage.png)

Go to `System -> Usage` to see:

- **AI usage** for a selectable time range (last 7, 30 or 90 days): number of calls, error rate, input and output tokens, average tokens per call, estimated cost, average and 95th percentile latency, tokens and cost per day, and breakdowns by feature (remediation, triage, asset enrichment, command parsing, tool recommendation), by provider and model, by project and by user (the top 10 of each).
- **Storage**: number of attachments and their total size.
- **Key-value server** (Redis): memory used (and the configured `maxmemory`, if any) and number of keys.
- **Message queues** (RabbitMQ): messages waiting and consumers for the `tasks`, `notifications`, `findings`, `webhooks`, `report-generation` and `report-emails` queues. A queue with messages waiting and no consumers means the service that processes it is not running. Unacknowledged messages are not included.
- **Client cache**: a button to discard all cached API responses, and a table of the queries cached by your browser (query key, fresh or stale status, number of observers and last update time).

The **System usage** dashboard widget shows a summary of this page for the last 30 days (AI calls, tokens and estimated cost, attachments, Redis memory and messages waiting in queues) and links to it. It requires the `system.*` permission.

The data comes from `GET /api/system/usage?from=<timestamp>&to=<timestamp>`. `from` defaults to 30 days before `to`, and `to` defaults to now.

#### AI usage and cost

Every call to the configured AI provider is recorded in the `ai_usage` table with the provider, model, feature, project, user, input and output tokens, latency, whether it succeeded, and the estimated cost. Calls that fail are recorded with zero tokens. Prompts and responses are never stored.

Token counts are whatever the provider reports. If a provider does not report usage (some self-hosted models), the call is counted with zero tokens.

The estimated cost is computed when the call is made from the prices you set under `System -> AI settings`:

- **Input price (USD per 1M tokens)**
- **Output price (USD per 1M tokens)**

Leave them empty to track tokens only (the default, and the right choice for Ollama). Changing a price affects only later calls, so past costs stay as they were charged at the time. Copy the prices from your provider's price list; the figure is an estimate and may differ from the provider's invoice.

##### Upgrading an existing installation

New installations create the `ai_usage` table automatically. The database initialisation script only runs on an empty database, so existing installations must create it once:

```sql
CREATE TABLE ai_usage
(
    id             SERIAL PRIMARY KEY,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    provider       VARCHAR(50) NOT NULL,
    model          VARCHAR(200) NOT NULL,
    feature        VARCHAR(50) NOT NULL,
    project_id     INTEGER NULL,
    user_id        INTEGER NULL,
    input_tokens   BIGINT NOT NULL DEFAULT 0,
    output_tokens  BIGINT NOT NULL DEFAULT 0,
    latency_ms     BIGINT NOT NULL DEFAULT 0,
    success        BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_cost NUMERIC(14, 6) NOT NULL DEFAULT 0
);

CREATE INDEX ai_usage_created_at_idx ON ai_usage (created_at);
```

Until the table exists, AI calls keep working (recording failures are logged as warnings) but the usage page cannot load.
