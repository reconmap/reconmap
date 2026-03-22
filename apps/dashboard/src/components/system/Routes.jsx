import AuditLogList from "components/auditlog/List";
import HelpSupportLayout from "components/HelpSupportLayout.jsx";
import SettingsLayout from "components/settings/SettingsLayout";
import ToolsLayout from "components/tools/ToolsLayout.jsx";
import { Route } from "react-router-dom";
import SystemIndexPage from ".";
import AiSettingsPage from "./AiSettingsPage";
import ApiTokensPage from "./api-tokens/ApiTokensPage";
import ExportPage from "./ExportPage";
import ImportPage from "./ImportPage";
import IntegrationsPage from "./Integrations";
import MailSettingsPage from "./MailSettingsPage";
import SystemHealthPage from "./SystemHealthPage";
import SystemUsagePage from "./SystemUsagePage";

const SystemRoutes = [
    <Route element={<HelpSupportLayout />}>
        <Route path="/auditlog" element={<AuditLogList />} />
    </Route>,
    <Route path={`/system`} element={<SettingsLayout />}>
        <Route path={`mail-settings`} element={<MailSettingsPage />} />
        <Route path={`ai-settings`} element={<AiSettingsPage />} />
        <Route path={`integrations`} element={<IntegrationsPage />} />
        <Route path={`api-tokens`} element={<ApiTokensPage />} />
    </Route>,
    <Route path={`/system`} element={<ToolsLayout />}>
        <Route path={`export-data`} element={<ExportPage />} />
        <Route path={`import-data`} element={<ImportPage />} />
    </Route>,
    <Route path={`/system`} element={<HelpSupportLayout />}>
        <Route index element={<SystemIndexPage />} />
        <Route path={`health`} element={<SystemHealthPage />} />
        <Route path={`usage`} element={<SystemUsagePage />} />
    </Route>,
];

export default SystemRoutes;
