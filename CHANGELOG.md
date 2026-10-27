# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security

- Upload hardening: attachment uploads are now limited by the API configuration (`Storage:Uploads` in `config-ngapi.json`): 20 MB per file, 10 files per request and a file type allow-list by default, and command output uploads are limited to 10 MB. Oversized files are rejected with `413`, disallowed types with `415`. The size of uploads can no longer overflow the stored `int` size, and the MIME type of an attachment is derived from its extension instead of being echoed from the client. Existing attachments are also served with the derived type. The OpenAPI document and the Swagger UI are only served in the Development environment. See [Attachment limits](docs/pages/admin-manual/attachment-limits.md).

### Changed

- The "Client cache" tab on the System usage page lists the cached dashboard queries (key, status, observers and last update) in a table, with the "Invalidate all queries" button above it.
- **Breaking (database, API, MCP and runner):** Projects, tasks, reports and vulnerabilities now use UUIDs instead of sequential integer ids, so their ids cannot be guessed or counted. Projects, tasks and reports use time-ordered UUIDv7 ids, and vulnerabilities use random UUIDv4 ids so the id does not reveal when a finding was created. The routes (`/api/projects/{id}`, `/api/tasks/{id}`, `/api/reports/{id}`, `/api/vulnerabilities/{id}` and their sub-routes), the `projectId` filters and fields, the `parentId` of comments and attachments, the `ids` of the bulk task update and delete, the MCP tools, resources and prompts (`reconmap://projects/{id}`), the dashboard URLs, and the `projectId` the runner sends with command output all use UUIDs. A malformed id returns `404 Not Found`. All other entities (users, organisations, assets, attachments, comments, notifications, runners and so on) keep integer ids. Vulnerability lists are ordered by creation time, with the id as tie-breaker. See [Identifiers](docs/pages/development/architecture.md#identifiers).
- **Breaking (database and data import):** The schema is edited in place without a migration, so existing databases must be recreated with the [destructive upgrade](docs/pages/admin-manual/upgrading-instance.md). An incremental upgrade does not work for this release, and runners must be upgraded together with the API. System data export files made before this release contain integer ids for these entities and cannot be imported. `testing/scripts/generate_demo_data.py` generates UUIDs for them.

- Tabs on the project, client, user, task and vulnerability details pages open the same way. Tabs no longer repeat their name as a heading (for example "Tasks", "Assets", "Project details", "Description" and "Attachment list"). Action buttons such as "New task", "New asset…", "New vulnerability", "New revision…", "Run AI triage" and "Generate remediation instructions with AI" sit in a toolbar row at the top of the tab, and the "view full audit log" link sits in the same row on the user Activity tab.
- **Breaking (API and database):** Projects no longer have a `visibility` setting. The `visibility` field is removed from the project API, MCP resources and tools, the `project` table and the project model definition. Access to a project is controlled only by its members. No migration is provided: the column is removed from the fresh schema, and existing databases keep it with its default, so they still accept new projects.
- **Breaking (API):** Notes are now called comments everywhere. `/api/notes` is now `/api/comments`. `POST /api/comments` takes `{ parentType, parentId, content }`, where `parentType` is `project`, `task` or `vulnerability`, and returns the created comment with `201 Created`. `GET /api/comments` returns `400 Bad Request` for other parent types and honours `limit`. Deleting a comment is limited to its author, administrators and superusers (`403 Forbidden` otherwise).
- **Breaking (database):** The `note` table is now `comment`, and its `visibility` column is removed. The schema is edited in place without a migration, so existing databases must be recreated with the [destructive upgrade](docs/pages/admin-manual/upgrading-instance.md). An incremental upgrade does not work for this release.
- **Breaking (system data import):** The `notes` entity is now `comments`. Files that use `notes` are still accepted, and the `Visibility` field of older exports is ignored. Comments cannot be exported.
- The comments panel on the project and vulnerability pages is redesigned. A composer sits at the top, comments are shown as cards with their author and relative time, and deleting asks for confirmation. Comments are added inline instead of through a modal dialog. The composer is hidden from roles that cannot comment. The vulnerability tab labels are translated.
- The OPA authorization policy uses the `comments` resource type instead of `notes`.

- Dashboard page titles and headers are more consistent: create pages are titled "New …" and edit pages "Edit …" (replacing "… details"), list and export/import headings use sentence case, the browser tab title is the same as the page heading, the page heading comes before the section label, the vulnerability title includes its external ID, the search results heading reads `Results for "…"`, and the not-found page has a top-level heading. Page titles and headers are now translatable.
- Dashboard buttons and navigation menu items use "New …" instead of "Create" or "Add" (for example "New task", "New Jira integration" and "New from template"). Form submit buttons read "Save" on both create and edit pages, replacing "Create", "Add" and "Update".
- The dashboard timezone list comes from the native `Intl.supportedValuesOf("timeZone")` instead of the `countries-and-timezones` library, reducing the bundle size.
- The dashboard formats relative dates ("5 minutes ago") with the native `Intl.RelativeTimeFormat` instead of the `react-time-ago` and `javascript-time-ago` libraries, reducing the bundle size.
- The advanced search page groups the form and the recent searches into boxes, lays the entity checkboxes out in a row, and explains when no entity is selected. Keywords are URL-encoded on submit, matching the header search box.
- Browser support: only the latest two versions of Chrome, Firefox and Safari are supported. The dashboard build targets (`browserslist`) and the [browser requirements](docs/pages/user-manual/browser-requirements.md) page were updated accordingly.
- The dashboard shows a colour icon next to each task priority in the tasks table and on the task details page: 🔵 Lowest, 🟢 Low, 🟡 Medium, 🟠 High, 🔴 Highest. The priority names are translated (Spanish, French and Chinese).
- The dashboard shows emoji instead of SVG images for the task status (☑ done, ☐ to do or doing) and the target icon in the asset and report version dialogs. The `vite-plugin-svgr` build dependency is removed.
- **Breaking (database and API):** User foreign key columns now use the `_id` suffix instead of `_uid`: `created_by_uid` → `created_by_id` (in most tables), `owner_uid` → `owner_id` (`vault`) and `assigned_to_uid` → `assigned_to_id` (`task`). The matching JSON fields are renamed too (for example `createdByUid` → `createdById`, `assignedToUid` → `assignedToId`, and the `assignedToUid` query parameter on `GET /api/tasks` → `assignedToId`). Existing databases must rename the columns before running this version; see [Upgrading a Reconmap instance](docs/pages/admin-manual/upgrading-instance.md).
- **Breaking (database):** Records created by the system rather than a user now have a `NULL` `created_by_uid` instead of pointing at a fake user with id `0`. The `created_by_uid` columns are nullable, the placeholder user row is no longer inserted, and the `Initialised` audit entry has a `NULL` actor. Fresh installations are unaffected. Existing databases are not migrated: they must be recreated, or altered by hand (drop the `NOT NULL` on each `created_by_uid` column and delete the user row with id `0`) before running this version.
- **Breaking (API):** `POST /api/commands/recommend` now takes an `objective` and returns `{ strategy, recommendations: [{ order, commandId, commandName, usageId, executablePath, arguments, rationale }] }` with fully resolved arguments (previously `recommendedArguments` could contain unreplaced placeholders). The dashboard no longer calls it; it creates scans through `POST /api/scans`.
- The dashboard "User activity over time" line chart is now a "User activity" heatmap: a GitHub-style calendar of user actions per day over the last 20 weeks, with a tooltip per day.
- `GET /api/system/usage` now returns a typed camelCase response and accepts optional `from` and `to` query parameters. **Breaking:** `attachments.total_count` / `total_file_size` are now `attachments.totalCount` / `totalFileSize`, and `queueLengths` is replaced by `queues` (RabbitMQ queue depth) plus `redis` and `ai`. The old `queueLengths` read Redis lists (`email:queue`, `tasks:queue`, `notifications:queue`) that the API never wrote to, so they were always empty.
- The System usage page is now split into tabs (AI usage, Storage, Infrastructure, Client cache) instead of one long page.
- The "Client queries cached" row moved from the usage table to its own "Client cache" section on the System usage page.
- The dashboard "API health" widget is now the "System health" widget (widget key `system-health`, replacing `api-health`; previously saved layouts that contain the old widget no longer show it). It lists the API, database, key-value, message queue, MCP server, SSE and attachments status, with response times, and links to the System health page. The System health page shows the same information.
- `GET /api/system/health` now checks the message queue for real (it was hardcoded as reachable), runs checks concurrently, and returns `latencyMs` for the database, key-value and message queue servers.
- Dashboard loading states are now consistent: pages keep their headings and actions while only the data region loads, tables show skeleton rows under their headers, dashboard widgets keep their card, and the spinner is a compact inline indicator instead of a page-sized one.
- Restructured the C# servers: `src/api/src` is now `src/server/Api`, `src/api/McpServer` is now `src/server/Mcp`, and the single `src/api/tests` project is split into `src/server/Api.Tests` and `src/server/Mcp.Tests`. The solution file is `src/server/Reconmap.slnx`. Run `dotnet test` from `src/server`. No change to the Docker image or runtime behaviour.
- The MCP server no longer queries the database directly: its tools and resources call the same application services (`IProjectService`, `ITaskService`, `IVulnerabilityService`, `IRunnerService`) as the REST API controllers, so the list and lookup logic lives in one place. No change to API or MCP output.
- **Breaking (database):** Upgraded PostgreSQL from 17 to 18.6 (`postgres:18.6-alpine`) in Docker Compose, the Kubernetes manifests and the Helm chart. PostgreSQL 17 data directories cannot be opened by PostgreSQL 18, so existing installations must dump the database and restore it into the new container before starting it. Follow [Upgrading PostgreSQL to 18](docs/pages/admin-manual/upgrading-postgresql.md). The Compose and Kubernetes definitions set `PGDATA=/var/lib/postgresql/data` explicitly, because PostgreSQL 18 images default to a different data directory that would not be on the persistent volume.
- Switched the Docker Compose Open Policy Agent image from `openpolicyagent/opa:1.20.2-istio` to the standard `openpolicyagent/opa:1.21.2`, since the API queries OPA over HTTP and does not need the Istio variant. The policy tests in CI use the same image.
- Updated the Docker Compose RustFS (S3-compatible object storage) image from `rustfs/rustfs:1.0.0-beta.8` to `rustfs/rustfs:1.0.1`.
- Dashboard: migrated routing from React Router v7 (`react-router-dom`) to React Router v8 data mode. The router is now created with `createBrowserRouter` and rendered with `RouterProvider`, and `react-router-dom` is replaced by `react-router`. This has no visible effect on URLs or pages.
- The attachments table "Uploaded by" column and file mimetype now show the values the API returns. The attachment list also includes each file's creator, which was previously missing.
- Dashboard: when the API answers `401 Unauthorized`, the dashboard now clears the stored OIDC session and restarts login through the OIDC client (`signinRedirect`) instead of reloading the context path. Concurrent 401s trigger a single redirect, and a repeat 401 within 10 seconds of a redirect no longer redirects again, which prevents redirect loops.

### Removed

- Comments no longer have a public or private setting. Every comment is visible to anyone who can access the project or vulnerability it belongs to. The user manual's claim that public comments are included in pentest reports was never implemented, and it has been removed. Comments are not included in reports.

- **Breaking (dashboard languages):** Portuguese and German translations are removed. Users whose language is set to `pt` or `de` fall back to English, and the language selector no longer offers them. Keycloak's `supportedLocales` no longer includes `pt`. Existing Keycloak realms must remove `pt` from their supported locales, and users with `pt` as their locale must pick another language. Unused translation strings have also been removed from the remaining languages.

### Added

- The dashboard shows the upload limits (maximum file size, number of files and allowed file types) next to the attachment and command output upload controls and validates files before uploading. The limits come from the new `GET /api/system/upload-limits` endpoint.
- The task form (create and edit pages) has a **Status** dropdown with Todo, Doing and Done. New tasks default to Todo.
- Users can leave comments on tasks. The task details page has a **Comments** tab, using the same comments panel as projects and vulnerabilities, and the API accepts `parentType: "task"` on `POST /api/comments` and `GET /api/comments`.
- The audit log records comment creation as well as deletion.
- Spanish and French translations for the comments panel.
- The project tasks heading shows the completed tasks as a progress bar instead of the "(x/y completed)" text.
- The projects list has a **Task progress** column, shown as a progress bar, instead of the **# Tasks** column, which was always empty. `GET /api/projects` returns `numTasks` and `numCompletedTasks` for each project.

- Demo data generator (`testing/scripts/generate_demo_data.py`) produces data that resembles a real engagement: real vulnerability and project categories, realistic findings with CVSS scores, assets, tasks, reports, notes, members, runners, scan runs and their tasks, command schedules, webhooks, notifications, and audit log entries. Pass `--seed` for reproducible output.
- Data import (`POST /api/system/data`) accepts `project_members`, `notes`, `notifications`, `reports`, `runners`, `scan_runs` (with nested `Tasks`), `command_schedules` and `webhooks`.
- Run scan: scans are now stored on the server (new `scan_run` and `scan_run_task` tables, `GET/POST /api/scans`, `GET /api/scans/{id}`, `POST /api/scans/tasks/{id}/status`). Starting a scan opens its page, which shows each tool's exact command, rationale, status and error; it keeps running if you navigate away and is listed under the new **Scan history** page and the **Recent scans** list on **Run scan**. **Existing installations must create the new tables**, see [Upgrading a Reconmap instance](docs/pages/admin-manual/upgrading-instance.md).
- Runner: reports scan task progress (running, succeeded, failed) to the API and uploads command output (stdout or output file) to `POST /api/commands/outputs` so findings and assets are parsed into the project. Upgrade runners together with the API.
- Dashboard: the Configure tab now lists each widget in its own row with the description below the title, and has Select all / Unselect all buttons.
- Dashboard: new "System usage" widget (widget key `system-usage`, requires `system.*`) showing AI calls, tokens and estimated cost for the last 30 days, attachments count and size, key-value server memory and messages waiting in queues, with a link to the System usage page.
- System usage page: AI usage and cost. Every call to the configured AI provider is now recorded in a new `ai_usage` table (provider, model, feature, project, user, input and output tokens, latency, success, estimated cost). **System → Usage** shows calls, error rate, tokens, estimated cost and latency (average and p95) for the last 7, 30 or 90 days, tokens and cost per day, and breakdowns by feature, model, project and user. Estimated cost uses the new optional **Input price** and **Output price** (USD per 1M tokens) AI settings; without them only tokens are tracked. **Existing databases must create the `ai_usage` table**, see [System monitoring](docs/pages/admin-manual/system-monitoring.md).
- System usage page: Redis memory and key count, and RabbitMQ queue depth (messages waiting and consumers) for every queue the API uses.
- MCP server: anonymous `GET /health` endpoint (database and Redis checks). The REST API probes it through the new optional `Mcp:HealthUrl` setting (`MCP_HEALTH_URL` in Docker Compose) and reports `mcpServer` in `GET /api/system/health`, shown on the System health page and dashboard widget.
- Dashboard: the **Configure** tab has a **Save and close** button next to **Save**. It saves the selected widgets and switches back to the **View** tab. **Save** keeps you on the Configure tab, as before.
- MCP server: Docker image `ghcr.io/reconmap/mcp` (built and pushed by the new `mcp-build-push` workflow) and an `mcp` service in Docker Compose (`app` profile, port `5520`). New optional `MCP_PUBLIC_URL` and `Keycloak:RequireHttpsMetadata` settings; the latter overrides the default of requiring HTTPS Keycloak metadata outside Development, for both the REST API and the MCP server. See [MCP Server](docs/pages/development/mcp-server.md).
- MCP server: prompts `triage_vulnerabilities` and `executive_summary` (each takes a `projectId` and requires read access to the project). Tools and resources are now split into one class per entity.
- MCP server: parameterized resource templates `reconmap://projects/{id}`, `reconmap://projects/{id}/vulnerabilities` and `reconmap://vulnerabilities/{id}`, with the same project-membership and OPA checks as the tools. See [MCP Server](docs/pages/development/mcp-server.md).
- MCP server: OAuth login for MCP clients. The server publishes OAuth protected resource metadata (`/.well-known/oauth-protected-resource`) and answers unauthenticated requests with a `WWW-Authenticate` challenge pointing to it, so clients such as the MCP Inspector can sign in through Keycloak. New public Keycloak client `mcp-client` (PKCE) for MCP clients, since Keycloak rejects anonymous dynamic client registration. New optional settings `Mcp:PublicUrl` and `Mcp:AllowedOrigins`. CORS for the MCP server now allows only the configured origins and the MCP Inspector defaults.
- MCP server: every request now requires a Reconmap API token or a Keycloak access token, and tools and resources apply the same project-membership and OPA rules as the REST API. Non-privileged users only see their own projects, and runners are limited to administrators and superusers. See [MCP Server](docs/pages/development/mcp-server.md). Previously the server was unauthenticated and returned all data.
- The audit log now records creations and updates of projects, assets, vulnerabilities, tasks, organisations, users, secrets and reports. Previously only deletions and a few creations were recorded.

### Fixed

- Task details: the status dropdown did not save changes, because it sent only the `status` field to the task API, which replaces the whole task and rejects partial bodies. It now sends the full task, and the page refreshes to show the new status.
- Vulnerability comments: the Save button was visible to every role, a success message appeared before the comment was saved, and failures were not reported.
- Deleting a comment no longer treats the empty `204 No Content` response as an error.
- Creating a comment no longer lets the client set the comment's own `id` or `createdAt`: the endpoint now takes a request DTO.

- Demo data generator: the generated import no longer fails with `Unknown entity` errors for `targets`, `documents`, `jira_integrations` and `azure_devops_integrations`. Assets replace targets, and the generator now references the categories seeded by the database.
- The advanced search page's "Recent searches" section showed nothing when the list was empty, and a failed request crashed the page. It now shows a message for the empty and error states, and each recent search links to an encoded results URL.
- Notifications state was out of sync between the header bell and the Notifications page: marking notifications as read (one, selected or from the bell) only refreshed the component that made the change, so the unread count stayed stale elsewhere. All notification writes now invalidate the shared notifications cache, and new notifications received over SSE refresh the page as well.
- Command output processing failed for every upload with `ReflectionTypeLoadException` (`Azure.AI.OpenAI` ... `cannot reduce access`): parser discovery threw when any loaded assembly could not be fully loaded. It now skips the types that cannot load.
- Uploading a command output failed with `404 Command not found`, and `GET /api/commands/{id}/usages/{usageId}` returned an empty `commandId`: usage definitions are rebuilt on every access, so the owning command id set at startup was lost. The lookup now sets it on the returned usage.
- Run scan queued every recommended tool with the literal arguments `{}`, so the runner tried to execute a program called `{}` and failed. The API now returns resolved commands (executable and arguments), the dashboard schedules exactly those, and the runner refuses to run any command line that still contains a `{{{placeholder}}}`.
- Run scan ignored the chosen objective and replaced placeholders with wrong sample values (for example scanning `localhost`). Tools are now selected per objective and target type, host/URL/domain placeholders are derived from the target, and tools recommended by the AI that are not in the catalog or do not apply to the target are discarded.
- Run scan did not report failures: HTTP errors when queuing were swallowed. The dashboard now shows the server's message when a scan cannot be started.
- Runner: command lines with quoted arguments were split on every space.
- Audit log: failed requests, such as a delete of an entity that does not exist, were recorded as successful actions. Only successful requests are audited now.
- Audit log: creating a vulnerability, task, organisation or user recorded the entry before the row had an ID, so the context stored `"id": 0`. The entry now includes the new ID.
- Dashboard: hiding the "Reconmap releases" or "Community discussions" widget hid the other one, because their components were swapped.
- Search returned every task, vulnerability, project and template instead of only the matches. The API now filters tasks, vulnerabilities and projects by the `keywords` query parameter (case-insensitive, matched against the name, summary or description), and `/api/vulnerabilities` honours `isTemplate`, so vulnerability template search no longer returns regular vulnerabilities. Searches containing a `%` no longer break the results page.

## [3.3.0] - 2026-10-13

### Changed

- **Breaking:** Renamed "agents" to "runners". A runner is a machine where commands, models and AI agents run, in the same way as runners in GitHub Actions and other CI/CD platforms. The rename covers:
    - Dashboard: the **Agents** page is now **Runners** (`/runners`, `/runners/:runnerId`), and the dashboard widget is **Runners**.
    - API: `/api/agents` is now `/api/runners`, and the boot and ping endpoints moved to `/api/runners/{clientId}/boot` and `/api/runners/{clientId}/ping`. The MCP resource `reconmap://agents` is now `reconmap://runners`.
    - Database: the `agent` table is now `runner`. Existing installations must run `ALTER TABLE agent RENAME TO runner;` before starting the new API.
    - Runner configuration: `config-agent.json` is now `config-runner.json`, and the `agentDirectory` key is now `runnerDirectory`.
    - Docker and Kubernetes: the image `ghcr.io/reconmap/agent` is now `ghcr.io/reconmap/runner`, and the Compose service and profile `agent` are now `runner`.
    - Repository: `src/agent` (the `reconmapd` runner) is now `src/runner`, and `src/runner` (the `rmap` CLI) is now `src/cli`. The Go module `reconmap/agent` is now `reconmap/runner`, and the shared library functions `AgentBoot` and `AgentPing` are now `RunnerBoot` and `RunnerPing`.
    - Release assets: the SBOMs are now `runner-sbom.spdx.json` and `cli-sbom.spdx.json`.
    - Runners and the API must be upgraded together, because runners call the renamed endpoints.
- Restructured the repository: `apps/` was renamed to `src/`, and the contents of `cli/` (`agent`, `runner`, `shared-lib`, plus its `Makefile`, `README.md` and Golang tooling) were moved into `src/`. Paths in GitHub workflows, Dependabot, Docker Compose, Kubernetes manifests and the documentation were updated accordingly. Go import paths are unchanged.
- **Breaking (database schema):** Keycloak is now the source of truth for user identity. The `user` table no longer stores `username`, `email`, `first_name`, `last_name`, `active`, `created_at`, `updated_at`, `last_login_ts`, `timezone` or `mfa_enabled`. The API merges these from Keycloak into responses, and editing a user writes identity fields to Keycloak and app fields (role, short bio, preferences) to the database. Language is stored as the Keycloak `locale` instead of `preferences.dashboard.language`. Existing installations must follow [Upgrading user identity storage](docs/pages/admin-manual/upgrading-user-identity.md) before running the new API.
- Moved language, theme and timezone from the separate "Your preferences" page into a **Preferences** section of the user edit form (`/users/{id}/edit`). Preferences are read-only for everyone except the user they belong to. The API rejects changes to `locale`, `timezone` and `preferences` made by anyone else, including administrators, with `403 Forbidden`. The `/users/preferences` page and the "Your preferences" menu entry have been removed.
- Users can now be edited in full from the dashboard: `PATCH /api/users/{id}` accepts names, email, username, active status, locale, timezone and role. Deleting a user also removes it from Keycloak. MFA status is read-only and comes from Keycloak.
- Improved the runner pages in the dashboard:
    - The **Add runner** form moved from the runners list to its own page at `/runners/create`. The runner credentials are displayed on that page after the runner is created.
    - The runners list, runner details and add runner pages have a page header and breadcrumbs.
    - The runners list has a **Refresh** button to reload the list on demand.
    - The runner details page shows every detail the runner reports: ID, client ID, enabled state, version, hostname, OS, architecture, CPU, memory, IP address, listen address, and last boot and ping times.

### Fixed

- Normalize Keycloak role group names (#272) (sean0407 <sean0407@gmail.com>)
- Fixed the **Enable MFA** action on the user profile doing nothing. The dashboard called `POST /api/users/{id}/actions`, which the API did not implement, and reported success regardless. The endpoint now adds the Keycloak `CONFIGURE_TOTP` required action so the user is asked to set up an authenticator app at next login, and the dashboard shows an error when the request fails.
- Fixed creating users from the dashboard failing with HTTP 400 ("Unable to create user: 400"). The API required a `subjectId` that the client never sends; it is now assigned from Keycloak during creation, so the request is no longer rejected by model validation.
- Fixed user creation sending role groups to Keycloak in the wrong case. Groups are now sent in lowercase (for example `administrator-group`), matching the realm configuration (#271).
- Fixed vulnerability creation and editing with a blank optional CVSS score. Empty scores are now saved as `null` instead of being submitted as invalid empty decimal values.
- Fixed webhook API requests failing because they referenced an undefined ASP.NET authorization policy. Webhook access now uses Reconmap's central OPA policy, which restricts it to `administrator` and `superuser` roles.
- Added secret-safe API startup diagnostics for listener and dependency configuration, emitted directly to standard error as well as through the configured logger, explicit lifecycle logs when startup is cancelled or the host stops, and direct request-pipeline exception diagnostics.
- Fixed a critical authorization bypass in the agent browser terminal. `/term` now requires a valid dashboard access token with the `administrator` or `superuser` role, validates issuer/audience/authorized party claims, enforces the configured dashboard origin, and no longer accepts credentials in URLs. Credit: @hackchang.
- Fixed a cross-tenant authorization bypass in unscoped API GET requests. Low-privilege users and clients are now limited to explicitly authorized, membership-scoped data; notification operations are recipient-scoped; vault, vulnerability, attachment, and note access is enforced in the API data layer; system data export/import and global ticketing integrations are administrator-only; and Jira/Azure DevOps tokens are no longer serialized in API responses. Credit: @hackchang.
- Fixed `NullReferenceException` in `AuditAttribute` when an action is executed under a null user context (such as a service account or user not resolved to the DB).
- Fixed agent ping/boot authorization by allowing dynamically registered service accounts (agent clients) to bypass database user checks in the global OPA authorization filter.
- Removed the hardcoded static Keycloak client `reconmapd-client` to guarantee all agents are registered dynamically.
- Fixed Keycloak token retrospection error ("token is not active") during agent (`reconmapd`) login due to missing audience mapping on dynamically created agents.
- Fixed typo in default agent configuration Client ID, correcting it from `reconmapd-cli` to `reconmapd-client`.
- Suppressed DB user resolver warning ("No subject found in db for user") for Keycloak service account (agent) requests.
- Resolved peer dependency conflict in dashboard between `@typescript-eslint` and TypeScript 7 by adding a package override for TypeScript in `apps/dashboard/package.json`.

### Added

- Added AnonRouter as a selectable AI provider. It reuses the existing OpenAI-compatible chat client against `https://api.anonrouter.ai/v1`, stores its API key encrypted alongside the other provider keys, and requires an explicit model identifier (no default model is assumed).
- Added a GitHub Actions workflow that runs the OPA policy tests when Rego policy files change.
- Added HTTP status code validation in Go agent client calls, ensuring `reconmapd` logs an error when the REST API returns a non-2xx response.
- Automatically add/ensure URL targets as project assets/targets in the selected project when a scan is initiated.
- Added AI-powered scan planning and tool recommendation: a new target-centric scan planner (`ScanTargetForm`) analyzes target inputs (URL, domain, IP, hostname, code repository), detects target type, and requests a tailored, ordered execution plan from the API via `POST /api/commands/recommend`.
- Created C# API recommendation engine (`ToolRecommendationService`) supporting two-tier recommendation (AI-enhanced plan if an LLM provider is configured, falling back to a rule-based matching engine).
- Added direct tool chaining via scheduled runner jobs (users can queue all recommended tools to the queue at once).
- Added agentic vulnerability triage: when scans discover new vulnerabilities, the AI autonomously produces a structured triage report (severity, exploitability, attack surface, immediate actions, false-positive check) for each finding during background processing.
- Added on-demand vulnerability triage: a new **Triage** tab on vulnerability detail pages lets analysts request a fresh AI triage assessment at any time via `POST /api/vulnerabilities/{id}/triage`.
- Added `TriageVulnerabilityAsync` to `IAiService` with a purpose-built rapid-triage prompt; works with any configured AI provider (Ollama, Azure OpenAI, OpenRouter).
- Improved `EnrichAssetAsync` / asset suggest-commands prompt to produce a tactical plan (recommended tools, exact runnable commands, key indicators to look for) instead of generic advice.
- Added AI features documentation page covering all agentic capabilities and the recommended Ollama setup.
- Added a new dashboard scan launcher under **Scans -> Start from URL** that ensures a URL asset exists for the selected project before preparing a URL-capable command usage.
- Implemented Azure OpenAI and OpenRouter/OpenAI chat client integrations in the C# API's `AiService` utilizing `Microsoft.Extensions.AI.OpenAI`, allowing admins to configure cloud LLM providers in the dashboard settings instead of being limited to local Ollama installations.
- Integrated Open Policy Agent (OPA) / Rego for centralized attribute-based access control (ABAC).
- Enforced project visibility constraints ensuring users with the Client role can only view their assigned projects.
- Added detailed audit logging for failed OPA authorization checks (`opa_authz_failed`).
- Implemented an experimental Model Context Protocol (MCP) server under `apps/api/McpServer` to expose Reconmap tools and resources (projects, tasks, findings, agents) to AI assistants.

### Removed

- Removed command management CRUD pages (Add, Edit, Details, List, Add Usage) and components (Form, UsageForm, Table, Badge, Outputs) from the dashboard to simplify platform workflow.
- Removed manual command selection dropdowns from the scan execution pages.
- Removed the "Vulnerabilities storage action" dropdown from the dashboard scan execution form.
- Removed `uint`/`ushort` types from all API entity models and service/controller signatures, replacing them with `int` throughout. This eliminates the EF Core `ConfigureConventions` workaround (which was converting `uint`→`bigint` and `ushort`→`int` for PostgreSQL compatibility) since all IDs and foreign keys are now native `int`, matching the existing `SERIAL`/`INT` PostgreSQL column types directly. No database migration is required.

### Changed

- Switched Docker Compose to the official Keycloak image, mounting Reconmap's realm import and theme provider and defining its readiness check in Compose.
- Refactored AI provider configuration into a validated `ai-providers.json` catalog, generic encrypted key/value persistence, a data-driven dashboard form, and a shared chat-client factory. OpenAI-compatible routers can now be added without provider-specific database columns or application UI changes.
- Upgraded the Docker Compose Open Policy Agent image to `openpolicyagent/opa:1.20.2-istio` and simplified equivalent user/client collection authorization rules with OPA 1.20's `or` keyword.
- Updated target scans to execute recommended tools automatically and transparently, showing live queuing status (Pending, Queuing, Queued, Failed) without requiring manual tool selection or manual queue triggers.
- Renamed the submit button in the scan target form from "Analyze & Recommend" to "Start scan" to align with the automated scan execution workflow.
- Simplified Scans navigation menu, consolidating "Run once", "Run on schedule", and "Start from URL" into a single, unified "Run scan" page.
- Changed the project license from Apache License 2.0 to the MIT License. The root `LICENSE`, the documentation license page, and the license labels in the API, dashboard, and agent Docker images and the agent/runner GoReleaser packaging now reflect MIT.
- Hidden the command usages selection dropdown in the scans execution and import pages in the dashboard UI, delegating usage selection internally.
- Updated scans to always require a target project where the findings will be saved, both on the frontend dashboard and on the C# API backend `UploadOutput` endpoint.
- Fixed type mismatch (uint key parameters) in C# controller tests.
- Removed the **Documents** feature (document library, CRUD pages, dashboard widget, API endpoints, MCP resource, and OPA policy entries) to simplify the product surface and focus on intelligence and insights rather than record-keeping.
- Removed the ability to execute commands manually using the `rmap` CLI runner tool, including the `command run` subcommand, associated runner packages, and manual execution tests.
- Removed the "Desktop" terminal environment option and instructions for manual `rmap` execution from the Scans page in the React dashboard UI, standardizing on agent-driven browser terminal executions.
- Added a comprehensive `NOTES.txt` post-installation message to the unified `reconmap` Helm chart detailing service URLs, port-forwarding instructions, and default credentials.
- Added a `Makefile` to the unified `reconmap` Helm chart under `infra/k8s/helm-charts/reconmap` to validate (lint), install, uninstall, and retrieve values/manifests.
- Created a unified `reconmap` Helm chart under `infra/k8s/helm-charts/reconmap` that packages the complete platform stack (Dashboard, API, Keycloak, PostgreSQL, Redis, RabbitMQ) into a single, cohesive, and configurable installation.
- Added RabbitMQ deployment and service manifests to the Kubernetes configuration, and registered the corresponding RabbitMQ connection settings in the API ConfigMap.
- Added "Agents" dashboard widget to show status of registered security agents.
- Added "Top vulnerable assets" dashboard widget to show assets with the highest count of active findings.
- Added an interactive CVSS v4.0 calculator component (`CvssCalculator.jsx`) that opens in a native HTML `<dialog>` launched from a field addon button next to the vulnerability vector input.

### Changed

- Migrated the relational database storage provider from MySQL to PostgreSQL. This includes swapping the C# API database provider from `Pomelo.EntityFrameworkCore.MySql` to `Npgsql.EntityFrameworkCore.PostgreSQL`, registering global type conversions in Entity Framework Core to map unsigned types (`uint`, `ushort`) to signed types, porting the SQL schemas and default data to PostgreSQL-compatible syntax, updating Docker Compose and Kubernetes/Helm orchestrations to deploy PostgreSQL, and updating all documentation and environment templates. Removed custom database build registries (`ghcr.io/reconmap/rest-api-db`) to utilize the official, trusted `postgres:17-alpine` database image everywhere, mounting schemas locally in Docker Compose and using ConfigMaps in Kubernetes/Helm. Simplified EF Core entities by removing redundant explicit column mappings, relying on runtime `snake_case` conventions, and configuring timezone-aware `TIMESTAMPTZ` and UTF-8 encoding options.
- Standardized Docker Compose project and container naming settings by explicitly defining project name `reconmap` at the root of `compose.yaml`, removing all custom static `container_name` properties to support environment scaling/flexibility, and updating all internal API configuration files, env secrets, and Kubernetes/Helm manifest container specs to resolve services directly via Docker network DNS names.
- Renamed all remaining occurrences and configuration properties of the old UI name `web-client` to `dashboard` across application config files, user preferences, C# API claims transformations, Helm chart templates, compose orchestrations, Kubernetes manifests, Keycloak realm mappings, and developer/user documentation.
- Standardized terminology by unifying on "vulnerability" / "vulnerabilities" instead of using "finding" / "findings" interchangeably, updating C# API parser properties, queue names, event types, report generation variables, Go CLI models, React dashboard views, and documentation.
- Consolidated Docker Compose configuration by migrating all development overrides from `apps/api/compose.yaml` to the root `compose.dev.yaml`, deleting the redundant compose file, and utilizing Docker Compose profiles (`profiles: ["app"]` with `COMPOSE_PROFILES=app` in `.env`) to allow default run-all and dev-exclude startups.
- Standardized the REST API (`ngapi`) port to `5510` across all Kubernetes raw manifests, Helm templates, values, and port-forwarding scripts, aligning with local development configuration.
- Updated network ports documentation (`docs/pages/admin-manual/network-ports.md`) to correctly reflect all ports used by the application components (including Keycloak, RabbitMQ, and Rustfs).
- Standardized entity and parameter naming by renaming all remaining references of "target/targets" to "asset/assets", and renamed asset "kind/kinds" to "type/types" across the database schema, C# API entities, Go CLI models, and React dashboard components.
- Replaced the third-party `@uiw/react-md-editor` component in the React dashboard with a custom, lightweight markdown editor featuring a native `<textarea>`, a basic formatting toolbar (bold, italic, headers, links, code, lists), and a tabbed edit/preview view.
- Standardized vulnerability metrics strictly on the CVSS v4.0 standard, replacing generic metric properties with explicit `cvss_score` and `cvss_vector` fields.
- **Dashboard**: Replaced the vendor-specific `keycloak-js` library with the standards-based `oidc-client-ts` + `react-oidc-context` for OIDC authentication. Token refresh is now handled automatically via `automaticSilentRenew`, and the custom `KeyCloakService` singleton has been replaced by a leaner `AuthService` module. The Keycloak server itself is unchanged; only the browser-side client library was swapped.


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

[Unreleased]: https://github.com/reconmap/reconmap/compare/3.3.0...main
[3.3.0]: https://github.com/reconmap/reconmap/compare/3.2.2...3.3.0
[1.5.0]: https://github.com/reconmap/reconmap/compare/0.1.0...1.5.0
