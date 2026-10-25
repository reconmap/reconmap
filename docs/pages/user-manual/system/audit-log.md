---
title: Audit log
parent: System
grand_parent: User manual
---

The audit log keeps track of all the user actions and is a great way to see what was done by who and when. In addition to this data, it includes the network IP, the user agent and geographical location from where the action was originated.

![Vulnerabilities view](/images/screenshots/audit-log.png)

Al the data in the audit log is permanent and non-modifiable.

The audit log records the following actions:

- User logged in and logged out
- Created: projects, assets, vulnerabilities, tasks, comments, organisations, users, secrets (the secret value is never recorded), reports and report templates
- Updated: projects, vulnerabilities, tasks, organisations, users and secrets
- Deleted: assets, projects, tasks, vulnerabilities, comments, users, secrets, runners, reports and other entities
- Attachments downloaded, and system data exported

Only successful changes are recorded. A request that fails, such as a delete of an entity that does not exist, leaves no entry.

Changes to other entities, such as contacts and integrations, are not recorded yet.

The audit log information can be exported to CSV to do aggregation and analysis.
