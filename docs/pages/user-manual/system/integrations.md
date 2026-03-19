---
title: Integrations
parent: System
---

Reconmap supports several ways to integrate with external tools and services. These integrations can be managed from the **Settings > Integrations** menu in the dashboard.

## Webhooks

Webhooks allow you to receive real-time notifications when certain events occur in Reconmap. When an event is triggered, Reconmap sends an HTTP POST request to the configured URL with a JSON payload.

### Configuring a Webhook

1. Go to **Settings > Integrations**.
2. Click on **Create webhook**.
3. Provide a **Name** for the webhook.
4. Enter the **URL** where the notification should be sent.
5. (Optional) Enter a **Secret** to sign the requests.
6. Specify the **Events** you want to subscribe to (e.g., `project.created`, `finding.created`, or `*` for all events).
7. Ensure **Is enabled** is checked and click **Create**.

## Jira Integration

The Jira integration allows you to automatically push new findings (vulnerabilities) to your Jira project as issues.

### Configuring Jira

1. Go to **Settings > Integrations**.
2. Click on **Add Jira integration**.
3. Provide a **Name** for the integration.
4. Enter your **Jira URL** (e.g., `https://your-domain.atlassian.net`).
5. Enter the **Email** associated with your Jira account.
6. Enter your Jira **API Token**.
7. Enter the **Project Key** of the Jira project where issues should be created.
8. Click **Create**.

Once configured and enabled, every time a new finding is created in Reconmap, it will be automatically sent to your Jira project.

## Azure DevOps Integration

The Azure DevOps integration allows you to automatically push new findings (vulnerabilities) to your Azure DevOps project as work items.

### Configuring Azure DevOps

1. Go to **Settings > Integrations**.
2. Click on **Add Azure DevOps integration**.
3. Provide a **Name** for the integration.
4. Enter your Azure DevOps **Organization URL** (e.g., `https://dev.azure.com/your-organization`).
5. Enter the **Project name** of the Azure DevOps project where work items should be created.
6. Enter your Azure DevOps **Personal Access Token**.
7. Click **Create**.

Once configured and enabled, every time a new finding is created in Reconmap, it will be automatically sent to your Azure DevOps project.

For the full setup guide, see the dedicated [Azure DevOps Integration](/user-manual/system/azure-devops/) page.
