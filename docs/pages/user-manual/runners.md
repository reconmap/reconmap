---
title: Runners
parent: User manual
---

Runners are the machines where Reconmap executes commands. You can see and manage them by navigating to **Settings > Runners** in the dashboard.

## Runners list

The list shows every registered runner with its status (**Online** if it pinged the API in the last 5 minutes, **Offline** otherwise), its name, hostname, operating system, architecture, CPU, memory, IP address, listen address, and the last boot and ping times.

Use the **Refresh** button to reload the list on demand, without reloading the page.

## Adding a runner

Click **Add runner** on the list page to open the **Add runner** page. Enter a name, the hostname, and the listen address, then submit the form. To return to the list, click **Runners** in the breadcrumb.

When the runner is created, its client ID and client secret are displayed on that page. They are only shown once, so copy them before leaving the page. Use them to configure the runner.

## Runner details

Click a runner's name to open its details page. It shows every detail the runner has reported:

- ID, client ID and whether the runner is enabled.
- Version, hostname, operating system, architecture, CPU and memory.
- IP address and listen address.
- When the runner last booted and last pinged the API.

Empty values are shown as `(empty)`, which usually means the runner has not reported that detail yet.

Users with the `administrator` or `superuser` role can also open a terminal on the runner from the details page. See [Runner terminal security](../admin-manual/runner-terminal-security.md) before enabling this in production.
