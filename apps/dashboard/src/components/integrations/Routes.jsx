import SettingsLayout from "components/settings/SettingsLayout.jsx";
import { Route } from "react-router-dom";
import ApiTokensPage from "./api-tokens/ApiTokensPage.jsx";
import AzureDevopsIntegrationCreatePage from "./ticketing/AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "./ticketing/AzureDevopsEdit";
import JiraIntegrationCreatePage from "./ticketing/JiraCreate";
import JiraIntegrationEditPage from "./ticketing/JiraEdit";
import IntegrationsListPage from "./ticketing/List";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-layout" element={<SettingsLayout />}>,
        <Route path="ticketing" key="integrations-list" element={<IntegrationsListPage />} />,
        <Route path="jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
        <Route path="jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
        <Route path="azure-devops/create" key="integrations-azure-devops-create" element={<AzureDevopsIntegrationCreatePage />} />,
        <Route path="azure-devops/:integrationId/edit" key="integrations-azure-devops-edit" element={<AzureDevopsIntegrationEditPage />} />,
        <Route path={`api-tokens`} element={<ApiTokensPage />} />
    </Route >
];

export default IntegrationsRoutes;
