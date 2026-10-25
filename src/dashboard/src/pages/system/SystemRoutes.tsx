import SystemIntegrationsPage from "pages/system/SystemIntegrationsPage";
import HelpSupportLayout from "layouts/HelpSupportLayout";
import SettingsLayout from "layouts/SettingsLayout";
import ToolsLayout from "layouts/ToolsLayout";
import AuditLogListPage from "pages/auditlog/AuditLogListPage";
import type { RouteObject } from "react-router";
import { SystemUrls } from "AppUrls";
import SystemAiSettingsPage from "./SystemAiSettingsPage";
import SystemExportPage from "./SystemExportPage";
import SystemHealthPage from "./SystemHealthPage";
import SystemImportPage from "./SystemImportPage";
import SystemMailSettingsPage from "./SystemMailSettingsPage";
import SystemUsagePage from "./SystemUsagePage";

const SystemRoutes: RouteObject[] = [
    {
        element: <HelpSupportLayout />,
        children: [{ path: SystemUrls.AuditLog, element: <AuditLogListPage /> }],
    },
    {
        path: SystemUrls.Data,
        element: <ToolsLayout />,
    },
    {
        path: SystemUrls.System,
        element: <SettingsLayout />,
        children: [
            { path: "mail-settings", element: <SystemMailSettingsPage /> },
            { path: "ai-settings", element: <SystemAiSettingsPage /> },
        ],
    },
    {
        path: SystemUrls.System,
        element: <ToolsLayout />,
        children: [
            { path: "export-data", element: <SystemExportPage /> },
            { path: "import-data", element: <SystemImportPage /> },
        ],
    },
    {
        path: SystemUrls.System,
        element: <HelpSupportLayout />,
        children: [
            { path: "health", element: <SystemHealthPage /> },
            { path: "usage", element: <SystemUsagePage /> },
            { path: "integrations", element: <SystemIntegrationsPage /> },
        ],
    },
];

export default SystemRoutes;
