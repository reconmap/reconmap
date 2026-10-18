---
title: Dashboard
parent: User manual
---

The Reconmap dashboard is what welcomes the user after logging in. The dashboard is made of widgets that present at a glance key performance and insight information about projects, vulnerabilities, team contributions and more.

![Dashboard view](/images/screenshots/dashboard.png)

Each user has its own view of the dashboard as they can select which of all available widgets to show on load.

To choose the widgets, open the **Configure** tab. Tick the widgets you want to see and click:

- **Save** to store your selection and stay on the Configure tab.
- **Save and close** to store your selection and go back to the **View** tab.

The left sidebar used in multi-section views (for example Project, Settings, and Library pages) can be collapsed and expanded with the chevron toggle button at the top of the menu. The last selected state is remembered for your browser.

Available widgets:

| Name                      | Description                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| My tasks                  | Shows a list of all open tasks assigned to you                                                                     |
| Vulnerability by risk     | Vulnerabilities grouped by risk (none, low, medium, high, critical)                                                |
| Active projects           | Shows a list of all non-archived projects                                                                          |
| Vulnerability by category | Vulnerabilities grouped by categories (error reporting, data validation, configuration, denial of service, etc...) |
| Recent activity           | Extract of audit log                                                                                               |
| User activitiy over time  | Chart of activity over time                                                                                        |
| System health             | Presents the status of the API, its backing services (database, Redis, message queue, storage) and the MCP server   |
| System usage              | Summarises AI calls, tokens and estimated cost (last 30 days), attachments storage, Redis memory and queue depth    |
| Recent vulnerabilities    | Shows the most recently reported vulnerabilities                                                                   |
| Runners                    | Shows the status of registered security runners                                                                     |
| Top vulnerable assets     | Shows assets with the highest count of active vulnerabilities                                                      |
