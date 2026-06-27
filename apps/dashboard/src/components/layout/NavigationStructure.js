import {
    AgentsUrls,
    ClientsUrls,
    CommandsUrls,
    DashboardUrls,
    DocumentsUrls,
    IntegrationsUrls,
    ProjectsUrls,
    ReportsUrls,
    ScansUrls,
    SearchUrls,
    SystemUrls,
    TasksUrls,
    ToolsUrls,
    UsersUrls,
    VulnerabilitiesUrls,
} from "AppUrls";
import Configuration from "Configuration";
import { ServerIssuesUrl, UserManualUrl } from "ServerUrls";

export const getNavigationStructure = (t) => [
    {
        name: t("Dashboard"),
        url: DashboardUrls.Default,
        isRoot: true,
    },
    {
        name: t("Projects"),
        title: t("Projects, tasks, reports, and templates"),
        url: ProjectsUrls.List,
        items: [
            {
                type: "menu",
                name: t("Projects"),
                url: ProjectsUrls.List,
                children: [{ name: t("Create"), url: ProjectsUrls.Create, permissions: "projects.create" }]
            },
            {
                type: "menu",
                name: t("Tasks"),
                url: TasksUrls.List,
                children: [{ name: t("Create"), url: TasksUrls.Create, permissions: "tasks.create" }]
            },
            {
                type: "menu",
                name: t("Reports"),
                url: ReportsUrls.List,
                children: [{ name: t("Report templates"), url: ReportsUrls.Templates }]
            }
        ]
    },
    {
        name: t("Scans"),
        title: t("Run commands and view outputs"),
        url: ScansUrls.List,
        items: [
            {
                type: "menu",
                name: t("Run once"),
                url: ScansUrls.RunOnce,
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("Run on schedule"),
                url: ScansUrls.RunOnSchedule,
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("View scheduled scans"),
                url: ScansUrls.Schedules,
                permissions: "commands.*",
            },
            {
                type: "menu",
                name: t("Import scan"),
                url: ScansUrls.Import,
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
                url: CommandsUrls.List,
                permissions: "commands.*",
                children: [{ name: t("Create"), url: CommandsUrls.Add, permissions: "commands.create" }]
            },
            {
                type: "menu",
                name: t("Vulnerabilities"),
                url: VulnerabilitiesUrls.List,
                permissions: "vulnerabilities.*",
                children: [
                    { name: t("Create"), url: VulnerabilitiesUrls.Create, permissions: "vulnerabilities.*" },
                    { name: t("Categories"), url: VulnerabilitiesUrls.Categories, permissions: "vulnerabilities.*" },
                ]
            },
            {
                type: "menu",
                name: t("Documents"),
                url: DocumentsUrls.List,
                permissions: "documents.*",
                children: [{ name: t("Create"), url: DocumentsUrls.Add, permissions: "documents.*" }]
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
            {
                type: "menu",
                name: t("Data"),
                url: SystemUrls.Data,
                permissions: "documents.*",
                children: [
                    { type: "menu", name: t("Export data"), url: SystemUrls.ExportData },
                    { type: "menu", name: t("Import data"), url: SystemUrls.ImportData },
                ]
            },

        ]
    },
    {
        name: t("Settings"),
        title: t("Application settings and administration"),
        url: "/settings",
        items: [
            { type: "menu", name: t("Users"), url: UsersUrls.List, children: [{ name: t("Create"), url: UsersUrls.Create }] },
            { type: "menu", name: t("Organisations"), url: ClientsUrls.List },
            { type: "divider" },
            { type: "menu", name: t("Agents"), url: AgentsUrls.List },
            { type: "divider" },
            { type: "menu", name: t("Custom fields"), url: "/settings/custom-fields" },
            { type: "divider" },
            {
                type: "menu",
                name: t("Integrations"),
                url: IntegrationsUrls.List,
                permissions: "documents.*",
                children: [
                    { type: "menu", name: t("Ticketing"), url: IntegrationsUrls.Ticketing, permissions: "administrator" },
                    { type: "menu", name: t("Webhooks"), url: IntegrationsUrls.Webhooks, permissions: "administrator" },
                    { type: "menu", name: t("API tokens"), url: IntegrationsUrls.ApiTokens },
                ]
            },
            { type: "divider" },
            { type: "menu", name: t("Mail settings"), url: SystemUrls.MailSettings },
            { type: "menu", name: t("AI settings"), url: SystemUrls.AiSettings },
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
            { type: "label", name: t("System information") },
            { type: "menu", name: t("System health"), url: SystemUrls.Health },
            { type: "menu", name: t("System usage"), url: SystemUrls.Usage },
            { type: "menu", name: t("Command output parsers"), url: SystemUrls.Integrations },
            { type: "divider" },
            { type: "menu", name: t("Audit log"), url: SystemUrls.AuditLog },
            { type: "menu", name: t("Support"), url: "/support" },
            { type: "menu", name: t("Log issue"), url: ServerIssuesUrl, external: true }
        ]
    }
];

