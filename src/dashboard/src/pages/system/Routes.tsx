import IntegrationsPage from "components/system/Integrations";
import HelpSupportLayout from "layouts/HelpSupportLayout";
import SettingsLayout from "layouts/SettingsLayout";
import ToolsLayout from "layouts/ToolsLayout";
import AuditLogList from "pages/auditlog/List";
import type { RouteObject } from "react-router";
import { SystemUrls } from "AppUrls";
import AiSettingsPage from "./AiSettings";
import ExportPage from "./Export";
import SystemHealthPage from "./Health";
import ImportPage from "./Import";
import MailSettingsPage from "./MailSettings";
import SystemUsagePage from "./Usage";

const SystemRoutes: RouteObject[] = [
    {
        element: <HelpSupportLayout />,
        children: [{ path: SystemUrls.AuditLog, element: <AuditLogList /> }],
    },
    {
        path: SystemUrls.Data,
        element: <ToolsLayout />,
    },
    {
        path: SystemUrls.System,
        element: <SettingsLayout />,
        children: [
            { path: "mail-settings", element: <MailSettingsPage /> },
            { path: "ai-settings", element: <AiSettingsPage /> },
        ],
    },
    {
        path: SystemUrls.System,
        element: <ToolsLayout />,
        children: [
            { path: "export-data", element: <ExportPage /> },
            { path: "import-data", element: <ImportPage /> },
        ],
    },
    {
        path: SystemUrls.System,
        element: <HelpSupportLayout />,
        children: [
            { path: "health", element: <SystemHealthPage /> },
            { path: "usage", element: <SystemUsagePage /> },
            { path: "integrations", element: <IntegrationsPage /> },
        ],
    },
];

export default SystemRoutes;
