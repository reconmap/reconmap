export const DashboardUrls = {
    Default: "/",
};

export const ClientsUrls = {
    List: "/organisations",
    Create: "/organisations/create",
    Edit: "/organisations/:organisationId/edit",
    Details: "/organisations/:organisationId",
};

export const ProjectsUrls = {
    List: "/projects",
    Create: "/projects/create",
    Edit: "/projects/:projectId/edit",
    Details: "/projects/:projectId",
    Report: "/projects/:projectId/report",
    ReportSend: "/projects/:projectId/report/send",
    Membership: "/projects/:projectId/membership",
    TaskCreate: "/projects/:projectId/tasks/create",
};

export const TasksUrls = {
    List: "/tasks",
    Create: "/tasks/create",
    Edit: "/tasks/:taskId/edit",
    Details: "/tasks/:taskId",
};

export const VulnerabilitiesUrls = {
    List: "/vulnerabilities",
    Create: "/vulnerabilities/create",
    Edit: "/vulnerabilities/:vulnerabilityId/edit",
    Details: "/vulnerabilities/:vulnerabilityId",
    Categories: "/vulnerabilities/categories",
};

export const CommandsUrls = {
    List: "/commands",
    Add: "/commands/add",
    Details: "/commands/:commandId",
    Edit: "/commands/:commandId/edit",
    Usages: "/commands/:commandId/usages",
};

export const DocumentsUrls = {
    List: "/documents",
    Add: "/documents/add",
    Details: "/documents/:documentId",
    Edit: "/documents/:documentId/edit",
};

export const UsersUrls = {
    List: "/users",
    Create: "/users/create",
    Details: "/users/:userId",
    Edit: "/users/:userId/edit",
    Preferences: "/users/preferences",
};

export const ScansUrls = {
    List: "/scans",
    RunOnce: "/scans/run-once",
    RunOnSchedule: "/scans/run-on-schedule",
    Schedules: "/scans/schedules",
    Import: "/scans/import",
};

export const ReportsUrls = {
    List: "/reports",
    Send: "/reports/:reportId/send",
    Templates: "/reports/templates",
};

export const IntegrationsUrls = {
    List: "/integrations",
    Ticketing: "/integrations/ticketing",
    JiraCreate: "/integrations/jira/create",
    JiraEdit: "/integrations/jira/:integrationId/edit",
    AzureDevopsCreate: "/integrations/azure-devops/create",
    AzureDevopsEdit: "/integrations/azure-devops/:integrationId/edit",
    ApiTokens: "/integrations/api-tokens",
    Webhooks: "/integrations/webhooks",
    WebhooksCreate: "/integrations/webhooks/create",
    WebhooksEdit: "/integrations/webhooks/:webhookId/edit",
};

export const SystemUrls = {
    AuditLog: "/auditlog",
    Data: "/data",
    System: "/system",
    MailSettings: "/system/mail-settings",
    AiSettings: "/system/ai-settings",
    Integrations: "/system/integrations",
    ExportData: "/system/export-data",
    ImportData: "/system/import-data",
    Health: "/system/health",
    Usage: "/system/usage",
};

export const SupportUrls = {
    Default: "/support",
};

export const SettingsUrls = {
    Default: "/settings",
    CustomFields: "/settings/custom-fields",
};

export const AssetUrls = {
    Add: "/projects/:projectId/assets/add",
    Details: "/assets/:assetId",
};

export const NotificationsUrls = {
    List: "/notifications",
};

export const SearchUrls = {
    KeywordsSearch: "/search/:keywords",
    AdvancedSearch: "/advanced-search",
};

export const ToolsUrls = {
    Default: "/tools",
    Vault: "/tools/vault",
    PasswordGenerator: "/tools/password-generator",
    VaultItemEdit: "/vault/:vaultItemId/edit",
};

export const AgentsUrls = {
    List: "/agents",
    Details: "/agents/:agentId",
};
