import SettingsLayout from "layouts/SettingsLayout";
import ApiTokensPage from "pages/integrations/api-tokens/ApiTokensPage";
import type { RouteObject } from "react-router";
import { IntegrationsUrls } from "AppUrls";
import AzureDevopsIntegrationCreatePage from "./ticketing/AzureDevopsIntegrationCreatePage";
import AzureDevopsIntegrationEditPage from "./ticketing/AzureDevopsIntegrationEditPage";
import JiraIntegrationCreatePage from "./ticketing/JiraIntegrationCreatePage";
import JiraIntegrationEditPage from "./ticketing/JiraIntegrationEditPage";
import IntegrationsListPage from "./ticketing/IntegrationsListPage";
import WebhookCreatePage from "./webhooks/WebhookCreatePage";
import WebhookEditPage from "./webhooks/WebhookEditPage";
import WebhooksListPage from "./webhooks/WebhooksListPage";

const IntegrationRoutes: RouteObject[] = [
    {
        path: IntegrationsUrls.List,
        element: <SettingsLayout />,
        children: [
            { path: "ticketing", element: <IntegrationsListPage /> },
            { path: "jira/create", element: <JiraIntegrationCreatePage /> },
            { path: "jira/:integrationId/edit", element: <JiraIntegrationEditPage /> },
            { path: "azure-devops/create", element: <AzureDevopsIntegrationCreatePage /> },
            { path: "azure-devops/:integrationId/edit", element: <AzureDevopsIntegrationEditPage /> },
            { path: "api-tokens", element: <ApiTokensPage /> },
            {
                path: "webhooks",
                children: [
                    { index: true, element: <WebhooksListPage /> },
                    { path: "create", element: <WebhookCreatePage /> },
                    { path: ":webhookId/edit", element: <WebhookEditPage /> },
                ],
            },
        ],
    },
];

export default IntegrationRoutes;
