import AuditLogList from "components/auditlog/List";
import SettingsLayout from "components/settings/SettingsLayout.jsx";
import { Route } from "react-router-dom";
import SystemIndexPage from ".";
import ExportPage from "./ExportPage";
import ImportPage from "./ImportPage";
import SystemIntegrationsPage from "./Integrations";
import SystemHealthPage from "./SystemHealthPage";
import SystemUsagePage from "./SystemUsagePage";

const SystemRoutes = [
    <Route path="/auditlog" element={<AuditLogList />} />,
    <Route path={`/system`} element={<SettingsLayout />}>
        <Route index element={<SystemIndexPage />} />,
        <Route path={`integrations`} element={<SystemIntegrationsPage />} />,
        <Route path={`health`} element={<SystemHealthPage />} />,
        <Route path={`usage`} element={<SystemUsagePage />} />,
        <Route path={`export-data`} element={<ExportPage />} />,
        <Route path={`import-data`} element={<ImportPage />} />,
    </Route>,
];

export default SystemRoutes;
