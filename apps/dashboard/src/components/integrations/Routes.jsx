import SettingsLayout from "components/settings/SettingsLayout.jsx";
import { Route } from "react-router-dom";
import AzureDevopsIntegrationCreatePage from "./AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "./AzureDevopsEdit";
import JiraIntegrationCreatePage from "./JiraCreate";
import JiraIntegrationEditPage from "./JiraEdit";
import IntegrationsListPage from "./List";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-layout" element={<SettingsLayout />}>,
        <Route path="" key="integrations-list" element={<IntegrationsListPage />} />,
        <Route path="jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
        <Route path="jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
        <Route path="azure-devops/create" key="integrations-azure-devops-create" element={<AzureDevopsIntegrationCreatePage />} />,
        <Route path="azure-devops/:integrationId/edit" key="integrations-azure-devops-edit" element={<AzureDevopsIntegrationEditPage />} />,
    </Route >
];

export default IntegrationsRoutes;
