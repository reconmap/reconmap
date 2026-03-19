import { Route } from "react-router-dom";
import IntegrationsListPage from "./List";
import AzureDevopsIntegrationCreatePage from "./AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "./AzureDevopsEdit";
import JiraIntegrationCreatePage from "./JiraCreate";
import JiraIntegrationEditPage from "./JiraEdit";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-list" element={<IntegrationsListPage />} />,
    <Route path="/integrations/jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
    <Route path="/integrations/jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
    <Route path="/integrations/azure-devops/create" key="integrations-azure-devops-create" element={<AzureDevopsIntegrationCreatePage />} />,
    <Route path="/integrations/azure-devops/:integrationId/edit" key="integrations-azure-devops-edit" element={<AzureDevopsIntegrationEditPage />} />,
];

export default IntegrationsRoutes;
