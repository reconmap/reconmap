import { AgentsUrls } from "components/agents/AgentsRoutes.jsx";
import OrganisationsUrls from "components/clients/OrganisationsUrls";
import SearchUrls from "components/search/SearchUrls";
import { ToolsUrls } from "components/tools/Routes.jsx";
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
                name: t("Project templates"),
                url: "/projects/templates",
                children: [{ name: t("Create"), url: "/projects/create?isTemplate=true", permissions: "projects.templates" }]
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
                    { name: t("Vulnerability templates"), url: "/vulnerabilities/templates", permissions: "vulnerabilities.*" }
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
            { type: "menu", name: t("Agents"), url: AgentsUrls.List }
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
            { type: "menu", name: t("Custom fields"), url: "/settings/custom-fields" },
            { type: "menu", name: t("Integrations"), url: "/integrations", permissions: "administrator" },
            { type: "divider" },
            { type: "menu", name: t("Mail settings"), url: "/system/mail-settings" },
            { type: "menu", name: t("AI settings"), url: "/system/ai-settings" },
            { type: "divider" },
            { type: "menu", name: t("Export data"), url: "/system/export-data" },
            { type: "menu", name: t("Import data"), url: "/system/import-data" },
            { type: "divider" },
            { type: "menu", name: t("API tokens"), url: "/system/api-tokens" }
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
            { type: "menu", name: t("System integrations"), url: "/system/integrations" },
            { type: "menu", name: t("Audit log"), url: "/auditlog" },
            { type: "divider" },
            { type: "menu", name: t("Support"), url: "/support" },
            { type: "menu", name: t("Log issue"), url: ServerIssuesUrl, external: true }
        ]
    }
];
