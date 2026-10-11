import IntegrationsPage from "components/system/Integrations";
import HelpSupportLayout from "layouts/HelpSupportLayout.jsx";
import SettingsLayout from "layouts/SettingsLayout.jsx";
import ToolsLayout from "layouts/ToolsLayout.jsx";
import AuditLogList from "pages/auditlog/List";
import { Route } from "react-router-dom";
import { SystemUrls } from "AppUrls";
import AiSettingsPage from "./AiSettings.jsx";
import ExportPage from "./Export.jsx";
import SystemHealthPage from "./Health.jsx";
import ImportPage from "./Import.jsx";
import MailSettingsPage from "./MailSettings.jsx";
import SystemUsagePage from "./Usage.jsx";

const SystemRoutes = [
    <Route element={<HelpSupportLayout />}>
        <Route path={SystemUrls.AuditLog} element={<AuditLogList />} />
    </Route>,
    <Route path={SystemUrls.Data} element={<ToolsLayout />}>
    </Route>,
    <Route path={SystemUrls.System} element={<SettingsLayout />}>
        <Route path={`mail-settings`} element={<MailSettingsPage />} />
        <Route path={`ai-settings`} element={<AiSettingsPage />} />
    </Route>,
    <Route path={SystemUrls.System} element={<ToolsLayout />}>
        <Route path={`export-data`} element={<ExportPage />} />
        <Route path={`import-data`} element={<ImportPage />} />
    </Route>,
    <Route path={SystemUrls.System} element={<HelpSupportLayout />}>
        <Route path={`health`} element={<SystemHealthPage />} />
        <Route path={`usage`} element={<SystemUsagePage />} />
        <Route path={`integrations`} element={<IntegrationsPage />} />
    </Route>,
];

export default SystemRoutes;
