import SettingsLayout from "layouts/SettingsLayout.jsx";
import ApiTokensPage from "pages/integrations/api-tokens/ApiTokensPage.jsx";
import { Route } from "react-router-dom";
import AzureDevopsIntegrationCreatePage from "./ticketing/AzureDevopsCreate.jsx";
import AzureDevopsIntegrationEditPage from "./ticketing/AzureDevopsEdit.jsx";
import JiraIntegrationCreatePage from "./ticketing/JiraCreate.jsx";
import JiraIntegrationEditPage from "./ticketing/JiraEdit.jsx";
import IntegrationsList from "./ticketing/List.jsx";
import WebhookCreatePage from "./webhooks/Create.jsx";
import WebhookEditPage from "./webhooks/Edit.jsx";
import WebhooksList from "./webhooks/List.jsx";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-layout" element={<SettingsLayout />}>,
        <Route path="ticketing" key="integrations-list" element={<IntegrationsList />} />,
        <Route path="jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
        <Route path="jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
        <Route path="azure-devops/create" key="integrations-azure-devops-create" element={<AzureDevopsIntegrationCreatePage />} />,
        <Route path="azure-devops/:integrationId/edit" key="integrations-azure-devops-edit" element={<AzureDevopsIntegrationEditPage />} />,
        <Route path={`api-tokens`} element={<ApiTokensPage />} />
        <Route path="webhooks">
            <Route index element={<WebhooksList />} />
            <Route path="create" element={<WebhookCreatePage />} />
            <Route path=":webhookId/edit" element={<WebhookEditPage />} />
        </Route>,
    </Route >
];

export default IntegrationsRoutes;
