import ApiTokensPage from "components/integrations/api-tokens/ApiTokensPage.jsx";
import AzureDevopsIntegrationCreatePage from "components/integrations/ticketing/AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "components/integrations/ticketing/AzureDevopsEdit";
import JiraIntegrationCreatePage from "components/integrations/ticketing/JiraCreate";
import JiraIntegrationEditPage from "components/integrations/ticketing/JiraEdit";
import IntegrationsListPage from "components/integrations/ticketing/List";
import WebhookCreatePage from "components/integrations/webhooks/Create.jsx";
import WebhookEditPage from "components/integrations/webhooks/Edit.jsx";
import SettingsLayout from "components/settings/SettingsLayout.jsx";
import { Route } from "react-router-dom";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-layout" element={<SettingsLayout />}>,
        <Route path="ticketing" key="integrations-list" element={<IntegrationsListPage />} />,
        <Route path="jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
        <Route path="jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
        <Route path="azure-devops/create" key="integrations-azure-devops-create" element={<AzureDevopsIntegrationCreatePage />} />,
        <Route path="azure-devops/:integrationId/edit" key="integrations-azure-devops-edit" element={<AzureDevopsIntegrationEditPage />} />,
        <Route path={`api-tokens`} element={<ApiTokensPage />} />
        <Route path="webhooks" element={<SettingsLayout />}>
            <Route index element={<WebhooksListPage />} />
            <Route path="create" element={<WebhookCreatePage />} />
            <Route path=":webhookId/edit" element={<WebhookEditPage />} />
        </Route>,
    </Route >
];

export default IntegrationsRoutes;
