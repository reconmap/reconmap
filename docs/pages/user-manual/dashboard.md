---
title: Dashboard
parent: User manual
---

The Reconmap dashboard is what welcomes the user after logging in. The dashboard is made of widgets that present at a glance key performance and insight information about projects, findings, team contributions and more.

![Dashboard view](/images/screenshots/dashboard.png)

Each user has its own view of the dashboard as they can select which of all available widgets to show on load.

To choose the widgets, open the **Configure** tab. Each widget has its own row with its description. Tick the widgets you want to see (use **Select all** or **Unselect all** to change every widget at once) and click:

- **Save** to store your selection and stay on the Configure tab.
- **Save and close** to store your selection and go back to the **View** tab.

The left sidebar used in multi-section views (for example Project, Settings, and Library pages) can be collapsed and expanded with the chevron toggle button at the top of the menu. The last selected state is remembered for your browser.

Available widgets:

| Name                      | Description                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| My tasks                  | Shows a list of all open tasks assigned to you                                                                     |
| Finding by risk     | Findings grouped by risk (none, low, medium, high, critical)                                                |
| Active projects           | Shows a list of all non-archived projects                                                                          |
| Finding by category | Findings grouped by categories (error reporting, data validation, configuration, denial of service, etc...) |
| Recent activity           | Extract of audit log                                                                                               |
| User activity             | Heatmap of user actions per day over the last 20 weeks                                                             |
| System health             | Presents the status of the API, its backing services (database, Redis, message queue, storage) and the MCP server   |
| System usage              | Summarises AI calls, tokens and estimated cost (last 30 days), attachments storage, Redis memory and queue depth    |
| Recent findings    | Shows the most recently reported findings                                                                   |
| Runners                    | Shows the status of registered security runners                                                                     |
| Top assets by findings     | Shows assets with the highest count of active findings                                                      |
