import { AgentsUrls } from "components/agents/AgentsUrls";
import OrganisationsUrls from "components/clients/OrganisationsUrls";
import SearchUrls from "components/search/SearchUrls";
import { ToolsUrls } from "components/tools/ToolsUrls";
import Configuration from "Configuration";
import { ServerIssuesUrl, UserManualUrl } from "ServerUrls";

export const getNavigationStructure = (t) => [
    {
        name: t("Dashboard"),
        url: "/",
        isRoot: true,
    },
    {
        name: t("Projects"),
        title: t("Projects, tasks, reports, and templates"),
        url: "/projects",
        items: [
            {
                type: "menu",
                name: t("Projects"),
                url: "/projects",
                children: [{ name: t("Create"), url: "/projects/create", permissions: "projects.create" }]
            },
            {
                type: "menu",
                name: t("Tasks"),
                url: "/tasks",
                children: [{ name: t("Create"), url: "/tasks/create", permissions: "tasks.create" }]
            },
            {
                type: "menu",
                name: t("Reports"),
                url: "/reports",
                children: [{ name: t("Report templates"), url: "/reports/templates" }]
            }
        ]
    },
    {
        name: t("Scans"),
        title: t("Run commands and view outputs"),
        url: "/scans",
        items: [
            {
                type: "menu",
                name: t("Run once"),
                url: "/scans/run-once",
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("Run on schedule"),
                url: "/scans/run-on-schedule",
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("View scheduled scans"),
                url: "/scans/schedules",
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("Import scan"),
                url: "/scans/import",
                permissions: "commands.*",
            }
        ]
    },
    {
        name: t("Library"),
        title: t("Commands, vulnerabilities, documents, and search"),
        url: "/library",
        items: [
            {
                type: "menu",
                name: t("Commands"),
                url: "/commands",
                permissions: "commands.*",
                children: [{ name: t("Create"), url: "/commands/add", permissions: "commands.create" }]
            },
            {
                type: "menu",
                name: t("Vulnerabilities"),
                url: "/vulnerabilities",
                permissions: "vulnerabilities.*",
                children: [
                    { name: t("Create"), url: "/vulnerabilities/create", permissions: "vulnerabilities.*" },
                    { name: t("Categories"), url: "/vulnerabilities/categories", permissions: "vulnerabilities.*" },
                ]
            },
            {
                type: "menu",
                name: t("Documents"),
                url: "/documents",
                permissions: "documents.*",
                children: [{ name: t("Create"), url: "/documents/add", permissions: "documents.*" }]
            },
            { type: "divider" },
            {
                type: "menu",
                name: t("Search"),
                url: SearchUrls.AdvancedSearch
            }
        ]
    },
    {
        name: t("Tools"),
        title: t("Security tools and agents"),
        url: "/tools",
        items: [
            { type: "menu", name: t("Vault"), url: ToolsUrls.Vault, permissions: "commands.*" },
            { type: "menu", name: t("Password generator"), url: ToolsUrls.PasswordGenerator, permissions: "commands.*" },
            { type: "divider" },
            {
                type: "menu",
                name: t("Data"),
                url: "/data",
                permissions: "documents.*",
                children: [
                    { type: "menu", name: t("Export data"), url: "/system/export-data" },
                    { type: "menu", name: t("Import data"), url: "/system/import-data" },
                ]
            },

        ]
    },
    {
        name: t("Settings"),
        title: t("Application settings and administration"),
        url: "/settings",
        items: [
            { type: "menu", name: t("Users"), url: "/users", children: [{ name: t("Create"), url: "/users/create" }] },
            { type: "menu", name: t("Organisations"), url: OrganisationsUrls.List },
            { type: "divider" },
            { type: "menu", name: t("Scanners"), url: "/system/integrations" },
            { type: "menu", name: t("Agents"), url: AgentsUrls.List },
            { type: "divider" },
            { type: "menu", name: t("Custom fields"), url: "/settings/custom-fields" },
            { type: "divider" },
            {
                type: "menu",
                name: t("Integrations"),
                url: "/integrations",
                permissions: "documents.*",
                children: [
                    { type: "menu", name: t("Ticketing"), url: "/integrations/ticketing", permissions: "administrator" },
                    { type: "menu", name: t("Webhooks"), url: "/integrations/webhooks", permissions: "administrator" },
                    { type: "menu", name: t("API tokens"), url: "/integrations/api-tokens" },
                ]
            },
            { type: "divider" },
            { type: "menu", name: t("Mail settings"), url: "/system/mail-settings" },
            { type: "menu", name: t("AI settings"), url: "/system/ai-settings" },
        ]
    },
    {
        name: t("Help & Support"),
        title: t("Help resources, system status, and support"),
        url: "/help",
        items: [
            { type: "menu", name: t("User manual"), url: UserManualUrl, external: true },
            { type: "menu", name: t("API docs"), url: `${Configuration.getDefaultApiUrl()}/../swagger/`, external: true },
            { type: "divider" },
            { type: "menu", name: t("System health"), url: "/system/health" },
            { type: "menu", name: t("System usage"), url: "/system/usage" },
            { type: "divider" },
            { type: "menu", name: t("Audit log"), url: "/auditlog" },
            { type: "menu", name: t("Support"), url: "/support" },
            { type: "menu", name: t("Log issue"), url: ServerIssuesUrl, external: true }
        ]
    }
];
