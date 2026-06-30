# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Implemented an experimental Model Context Protocol (MCP) server under `apps/api/McpServer` to expose Reconmap tools and resources (projects, tasks, findings, documents, agents) to AI assistants.
- Added a comprehensive `NOTES.txt` post-installation message to the unified `reconmap` Helm chart detailing service URLs, port-forwarding instructions, and default credentials.
- Added a `Makefile` to the unified `reconmap` Helm chart under `infra/k8s/helm-charts/reconmap` to validate (lint), install, uninstall, and retrieve values/manifests.
- Created a unified `reconmap` Helm chart under `infra/k8s/helm-charts/reconmap` that packages the complete platform stack (Dashboard, API, Keycloak, MySQL, Redis, RabbitMQ) into a single, cohesive, and configurable installation.
- Added RabbitMQ deployment and service manifests to the Kubernetes configuration, and registered the corresponding RabbitMQ connection settings in the API ConfigMap.
- Added "Agents" dashboard widget to show status of registered security agents.
- Added "Top vulnerable assets" dashboard widget to show assets with the highest count of active findings.
- Added an interactive CVSS v4.0 calculator component (`CvssCalculator.jsx`) that opens in a native HTML `<dialog>` launched from a field addon button next to the vulnerability vector input.

### Changed

- Standardized the REST API (`ngapi`) port to `5510` across all Kubernetes raw manifests, Helm templates, values, and port-forwarding scripts, aligning with local development configuration.
- Updated network ports documentation (`docs/pages/admin-manual/network-ports.md`) to correctly reflect all ports used by the application components (including Keycloak, RabbitMQ, and Rustfs).
- Standardized entity and parameter naming by renaming all remaining references of "target/targets" to "asset/assets", and renamed asset "kind/kinds" to "type/types" across the database schema, C# API entities, Go CLI models, and React dashboard components.
- Replaced the third-party `@uiw/react-md-editor` component in the React dashboard with a custom, lightweight markdown editor featuring a native `<textarea>`, a basic formatting toolbar (bold, italic, headers, links, code, lists), and a tabbed edit/preview view.
- Standardized vulnerability metrics strictly on the CVSS v4.0 standard, replacing generic metric properties with explicit `cvss_score` and `cvss_vector` fields.

### Removed

- Removed the deprecated and obsolete `dashboard` Helm chart (`infra/k8s/helm-charts/dashboard`) in favor of the unified `reconmap` Helm chart.
- Removed the "Popular commands" widget from the dashboard as commands are now static/hardcoded.
- Removed command search capability from both the React dashboard search results and the Go `rmap` runner CLI tool, as commands are now static.
- Removed the `@uiw/react-md-editor` dependency from the dashboard application.
- Removed all support for OWASP Risk Rating metrics across the database schema, C# API entities, Go CLI models, and React dashboard components.
- Removed project-level vulnerability metrics settings (`vulnerability_metrics` column).
- Removed obsolete references and configuration mounts for `data/attachments` (templates are now packaged inside the API container).
- Removed support for generating and previewing reports in HTML and TXT formats (only Word, Markdown, and Typst remain).
- Removed report preview functionality from the dashboard and API.

### Changed

- Integrated report revisions as a dedicated "Reports" tab directly within the project details page, rather than keeping it as a standalone page.

### Added

- Added ability to select multiple notifications and perform bulk actions (mark as read, mark as unread, delete).
- `ReportGenerationProcessor` background service to generate report files asynchronously via RabbitMQ.
- Unified secrets management using a central `.env` file, enabling runtime environment variable overrides for both the C# API (using ASP.NET Core environment mapping) and the Go CLI/agent (using dynamic reflection overrides), which removes the need to hardcode secrets inside application JSON configuration files.
- Added Trivy, Semgrep, Bandit, and Snyk security commands configured to output to SARIF and process results using the SARIF parser.
- Added CycloneDX Software Bill of Materials (SBOM) JSON parser (`CycloneDxParser`) and the `Syft` tool command to extract dependency packages as assets and associate vulnerability scanning findings.

### Changed

- Migrated the real-time notification push mechanism from WebSockets to Server-Sent Events (SSE), utilizing standard ASP.NET Core JWT Bearer authentication via custom query parameter token extraction, and removed redundant Connection headers from SSE response streams to prevent connection aborts.
- Refactored the dashboard reports list page to listen to SSE events and automatically trigger query cache invalidation for seamless, real-time page refreshes.
- Refactored report creation in `ReportsController` to delegate generation to a background queue, returning a `202 Accepted` status immediately.
- Updated reports retrieval query to return pending reports and disabled download/email options in the dashboard until report generation is complete.
- Renamed integrations that push data to third-party services (Jira, Azure DevOps, and Webhooks) from processors to publishers (e.g. `JiraPublisher`, `AzureDevopsPublisher`, `WebhookPublisher`).
- Renamed command output processors to Command Parsers (e.g. `NmapParser`, `SarifParser`, etc., implementing `ICommandParser`).
- Moved commands and usages definitions fully into C# code (using reflection and string-based keys) rather than database tables, keeping them closely aligned with their corresponding output parsers.
- Updated Go CLI runner and agent to support string-based command and usage IDs.
- Integrated the Password Generator directly into the Credential Vault creation and editing forms (`VaultSecretForm` and `VaultItemEdit`) as an interactive native HTML modal next to the secret value field, rather than keeping it as a standalone page.
- Moved the "Scanners" settings page to the "Help & Support" layout under a new "System information" section label as "Command output parsers", grouping it alongside System Health and System Usage.

### Removed

- Database tables `command` and `command_usage`.
- `Commands Library` navigation and views (CRUD pages) from the React dashboard UI.
- Standalone "Password generator" page and route from the dashboard and navigation sidebar.
- Standalone global "Vault" page and menu link, keeping only the project-level Vault interfaces.

- Support for parsing SARIF results files in the API using the `Sarif.Sdk` library to import security findings.
- **System of Intelligence** features:
  - **Generic LLM Parser**: A new command output processor that uses LLMs to parse results from any security tool into structured assets and findings.
  - **Automated Finding Remediation**: Automatically generates remediation instructions using AI for newly discovered findings.
  - **Intelligent Finding Deduplication**: Prevents duplicate findings from being created in the same project/target.
  - **Asset Scan Strategist**: New "Enrich" endpoint for assets that provides AI-generated scan recommendations and next steps.
- Jira integration for findings: push findings to Jira as issues.
- Azure DevOps integration for findings: push findings to Azure DevOps as work items.
- Integrated Webhooks, Jira, and Azure DevOps under a new "Integrations" management section.
- API token authentication feature for programmatic access without JWT.
- Support for "Full" and "Read-only" token scopes.
- Management UI for API tokens in System settings.
- Ability to add and remove Reconmap agents from the Dashboard
- Mail settings UI for SMTP/IMAP configuration, plus background delivery of report emails with the selected report revision attached.
- Collapsible and expandable sidebar in Dashboard side-menu layouts, with browser-persisted state.
- React Error Boundary support to protect dashboard layouts and subcomponents against unhandled runtime crashes, featuring diagnostic error details and retry options.

### Fixed

- Fix Web Client API URL configuration in Kubernetes by adding the missing `/api` prefix to `reconmapApiUrl` in `dashboard-configmap.yaml`.
- Fix Kubernetes deployments crash loop by wrapping the liveness probe execution in a shell (`/bin/sh -c`) for the `mysql` and `keycloak` deployments.
- Fix MySQL database initialization on Kubernetes by adding the missing user and password environment variables to `mysql-deployment.yaml`.
- Fix Kubernetes DNS service name resolution in the API configuration by updating the database, cache, message queue, and storage hostnames in `ngapi-configmap.yaml`.
- Renamed Kubernetes `web-client` manifest filenames, resource names, and labels to `dashboard` for consistency, and updated the Helm chart template files and Makefile targets accordingly.
- Fix report templates deletion and creation by implementing the missing template upload `POST` endpoint in the API, cascade-deleting associated attachments on template deletion, and adding react-query invalidation and refetching on the frontend.
- Fixed Entity Framework Core row-limiting operator warning in documents query by adding explicit order by.
- Fixed missing push notifications after asynchronous report generation by ensuring Notification database records are persisted before broadcasting SSE ping via RabbitMQ.
- Fixed false-positive CORS errors and immediately aborted connections in Firefox/Chrome caused by React 18 Strict Mode mounting/unmounting behavior with Server-Sent Events.
- Fix `ReferenceError: SearchUrls is not defined` crash in dashboard Search Results page.
- Fix dashboard audit page crash due to useLocation hook context mismatch by resolving the react-router/react-router-dom package inconsistency.
- Fix Go agent docker build command path and context mismatch in `.github/workflows/cli-binaries-build-deploy.yml` and `cli/agent/Makefile` by referencing the correct build context (`cli`).
- Fix agent scheduler signature discrepancy in `cli/agent/internal/app_test.go` to restore test compilation and success.
- Fix compilation error in `cli/shared-lib/pkg/api/functions_test.go` by updating the `models.CommandUsage` mock and assertions to use `Description` instead of `Name`.
- Fix Docker Compose resource conflict error (`services.keycloak conflicts with imported resource`) in `apps/api/compose.yaml` by replacing the `include` directive with `extends` for compatibility across various Docker Compose versions.
- Complete the previously half-implemented report-by-email flow by queuing delivery through RabbitMQ and sending the generated report attachment to the selected recipients.
- Fix pagination logic in the API that incorrectly defaulted to the last page, causing incomplete results in projects, findings, and other lists.

### Changed

- Consolidated local API Docker Compose configurations by merging `apps/api/src/compose.yaml` into `apps/api/compose.yaml`, updating references in Makefiles and development guides.
- Renamed repetitive API directory path from `apps/api/app` to `apps/api/src` to align with standard project layout conventions, and updated all project files, test project reference, GitHub workflow, compose setups, and development guides.
- Upgrade React Dashboard third-party dependencies (including ESLint, Vite, TypeScript, i18next, and React)
- Restructured Docker Compose configuration to utilize the `include` directive, making the top-level `compose.yaml` the production-grade source of truth while inheriting and applying development/local overrides in `apps/api` and `apps/api/src`, eliminating config duplication.
- Migrated message queue from Redis to RabbitMQ for improved reliability and scalability.
- Upgrade to MySQL 9.6
- Disable MySQL performance schema by default
- Simplify and optimise docker images
- Replace `pocoglot` with an OpenAPI Generator pipeline based on `data/model-definitions/definitions/*.yaml` for Golang and Typescript artifacts.
- Move CLI code from own repository to the main one.
- Move Web client code to `apps/dashboard` and rename to Dashboard.
- Rewrote API in C# (.NET 10) and moved to `apps/api`.
- Reorganized data files into `data/` directory (imports, model definitions, attachments).
- Upgrade to Vite 8

### Removed

- Remove unused code in web client using knip

## [3.0.0-alpha]

### Added

- Add French language translations
- Clone task feature
- Add user location (city, country) to audit log table
- Add 'Onboarding' project to new instances to help with initial setup
- Add logging level and handlers to config file
- Add Chinese translation (Thanks, [Zhaoyonghua](https://github.com/scanner521)!)
- Link to advanced search from sidebar, together with recent search history.
- Add queue lengths to system usage
- Add redis connection to system health page
- Helm chart for web client
- Ability to render reports in plain text formats (Markdown, HTML), in addition to Word.
- 'Mark all notifications as read' button
- Added "Duration estimate" to tasks
- Added Password Generator tool to the UI
- Add integration with Ollama
- Add configuration option to set agent run directory
- Add JSON schema for all config files
- Add German translation by [Eren Kemer](https://github.com/eren-kemer). Thanks!

### Changed

- Refactored UI to use tanstack query and benefit from caching, retries and other niceties.
- Separate full name into first name and last name fields
- Allow to use multiple languages/locales in Keycloak (Spanish, French, Portuguese, ...)
- Move Keycloak healthcheck to the Dockerfile
- Upgrade to Keycloak 26.3
- Menu re-design and polish
- Application logs page removed in favour or centralised log management solutions such as Graylog
- API upgraded to MySQL 8.4 (from 8.0)
- API upgraded to PHP 8.3 (from 8.2)
- API ugpraded to Redis 7.4 (from 6.0)
- Web client upgraded to Vite 5 (from 4)
- Web client upgraded to Yarn 4.4 (from 1)
- Notes (eg Project Notes) have been renamed to Comments
- Comments (aka Notes) are now easier to add directly on the page instead of in a popup.
- Comments page sections redesigned.
- Remove gravatar.com usage
- Moved k8s resources to main repo
- Renamed docker-compose.yml to compose.yaml
- Replace ufoscout/docker-compose-wait with docker compose healthchecks
- Tidy up compose.yaml file
- Removed Docker dependency from the rmap command
- Replace quay.io with ghcr.io
- Change vault cipher to aes-256-gcm
- Move CLI configs from ~/.reconmap to ~/.config/reconmap
- Rename config files from config.json to config-api.json and environment.js to config-ui.js
- Rename Targets to Assets, Vulnerabilities to Findings
- Add project creator as member of project by default
- Converted Web UI config file from JS (Javascript) to JSON.
- Updated code of conduct
- Simplify compose volumes
- Show Reconmap logo on keycloak account page
- Resolved issued with mobile menu navigation

### Removed

- Ability for admin to manually set passwords for new users
- Mobile client repository archived. This officially marks the sunsetting of this feature.

## [2.0.0]

### Added

- [Keycloak](https://www.keycloak.org/) integration

### Changed

- Web client: Upgraded to Chakra v2
- Rest API: Upgraded to Monolog v3

### Fixed

-

## [1.5.0]

### Added

- Configurable project categories
- Web client: Add refresh button to system logs page
- Web client: Allow to remove normal and small organisation logos
- Reporting: Management summary and conclusion added to projects
- Database: Added +900 commands from the Orange Cyberdefense arsenal tool (https://github.com/Orange-Cyberdefense/arsenal)
- Web client: Pagination to the command list
- Web client: Added searchable command dropdown to tasks
- Web client: Filter by assignee in task list page.
- Pagination to project list

### Changed

- Correctly deal with entity dependencies in the db (delete on cascade for most tables)
- Web client: Upgrade to React 18
- Log warning when trying to export invalid entity type
- Web client: The pagination component now can jump to any page

### Fixed

- Web client: Fixed issue with project template tasks not showing
- Web client: Fixed issue on the project creation form creating successful toast on failure

## 1.1.0

### Added

- Add licenses page on the Web client
- Add filters to the vulnerabilities page
- Add setting to allow \* CORS origins
- Add priority filter for tasks
- Add multiple contacts to client (general, billing, technical)
- Add project credential vault (Thanks to Karel Rozhon)

### Changed

- Store user notifications on server (introduces ability to mark notifications as read/unread)

### Fixed

## 0.10.0

### Added

- Add support for vulnerability sub-categories
- Add support for Word/LibreOffice report templates.
- Add ability to launch commands from the Web client and see them running on an embedded terminal
- Add ability to set vulnerabilities as public or private. Private ones are not shown to the customer.
- Add ability to create and delete vulnerability categories
- Add health endpoint to API
- Add new health widget and page to Web client
- Add ability to search for tasks from the CLI
- Add new fields to vulnerabilities: remediation complexity, remediation priority, external ID, references
- Add option to sort vulnerability columns in the frontend
- Add project weekly report
- Add chart widgets to project page
- Add priority field to tasks

### Changed

- Return error messages if imported file is corrupt or invalid
- Change default ports (api=5500, webclient=5510, agent=5520/5530)
- Kubernetes definitions files were updated
- Change license to Apache 2.0
- Allow targets to have sub-targets (eg parent host 127.0.0.1, children ports 80, 443, 22, 3306, ...)
- User preferences (web client theme, dashboard widgets) are stored and retrieved from the server

## 0.9.5

### Added

- Add support for tags in vulnerabilities, commands and targets.
- Add link to API spec docs in the sidebar
- Add application logs to the web client
- Add list of projects as a tab in the client pages
- Add advanced search

### Changed

- Change some forms to show as popups instead of new pages

### Fixed

- Fixed logic that allowed to add existing members to projects.

## 0.9.0

### Added

- Add vulnerability statuses
- Add documents section
- Add archive project option
- Add bulk transition of tasks
- Add automatic password generation for new users
- Add new task due date
- Add new client role

### Changed

- New upload limits
- Rename existing user roles
- Change import/export format to JSON
- Change reports styling

## 0.8.5

### Added

- Introduce new commands views (CRUD)
- Introduce new task status (todo/doing/done) vs (open/closed)
- Add audit to delete target action
- Add full name and short bio fields to users

### Changed

- Upgrade composer dependencies
- Stricter makefiles
- Return client and user information from various other entities
- Use all space available for forms

## 0.8.0

### Added

- Add rules of engagement to projects
- Add delete button to user page
- Add edit task page
- Add collapsable sidebar navigation

### Changed

- Record user agent in audit log

### Fixed

- Fix problem with minimum number of pages in paginator
- Fix link to import project templates

## 0.7.5

### Added

- Add support for notes at the project and vulnerability levels.
- Add makefile database migration target

### Changed

- Change application to no longer fail with the log file is not writable.

## 0.7.0

### Added

- Add basic functionality: clients, projects, tasks, vulnerabilities, ...

[Unreleased]: https://github.com/reconmap/reconmap/compare/1.5.0...master
[1.5.0]: https://github.com/reconmap/reconmap/compare/0.1.0...1.5.0
