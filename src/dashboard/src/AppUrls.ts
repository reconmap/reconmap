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

export const FindingsUrls = {
    List: "/findings",
    Create: "/findings/create",
    Edit: "/findings/:findingId/edit",
    Details: "/findings/:findingId",
    Categories: "/findings/categories",
};


export const UsersUrls = {
    List: "/users",
    Create: "/users/create",
    Details: "/users/:userId",
    Edit: "/users/:userId/edit",
};

export const ScansUrls = {
    List: "/scans",
    RunOnce: "/scans/run-once",
    Runs: "/scans/runs",
    RunOnSchedule: "/scans/run-on-schedule",
    RunFromUrl: "/scans/run-from-url",
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

export const RunnersUrls = {
    List: "/runners",
    Details: "/runners/:runnerId",
};
