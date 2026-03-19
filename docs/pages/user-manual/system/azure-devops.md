---
title: Azure DevOps Integration
parent: System
---

The Azure DevOps integration allows you to automatically push new findings (vulnerabilities) to your Azure DevOps project as work items.

You can manage Azure DevOps integrations from **Settings > Integrations** in the dashboard.

### Configuring Azure DevOps

1. Go to **Settings > Integrations**.
2. Click on **Add Azure DevOps integration**.
3. Provide a **Name** for the integration.
4. Enter your Azure DevOps **Organization URL** (e.g., `https://dev.azure.com/your-organization`).
5. Enter the **Project name** of the Azure DevOps project where work items should be created.
6. Enter your Azure DevOps **Personal Access Token**.
7. Click **Create**.

Once configured and enabled, every time a new finding is created in Reconmap, it will be automatically sent to your Azure DevOps project.

See also the general [Integrations](/user-manual/system/integrations/) page for the other supported integration types.
