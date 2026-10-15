import SettingsLayout from "layouts/SettingsLayout";
import ApiTokensPage from "pages/integrations/api-tokens/ApiTokensPage";
import { Route } from "react-router";
import { IntegrationsUrls } from "AppUrls";
import AzureDevopsIntegrationCreatePage from "./ticketing/AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "./ticketing/AzureDevopsEdit";
import JiraIntegrationCreatePage from "./ticketing/JiraCreate";
import JiraIntegrationEditPage from "./ticketing/JiraEdit";
import IntegrationsList from "./ticketing/List";
import WebhookCreatePage from "./webhooks/Create";
import WebhookEditPage from "./webhooks/Edit";
import WebhooksList from "./webhooks/List";

const IntegrationsRoutes = [
    <Route path={IntegrationsUrls.List} key="integrations-layout" element={<SettingsLayout />}>,
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
