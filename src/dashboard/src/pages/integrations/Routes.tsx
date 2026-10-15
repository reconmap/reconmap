import SettingsLayout from "layouts/SettingsLayout";
import ApiTokensPage from "pages/integrations/api-tokens/ApiTokensPage";
import type { RouteObject } from "react-router";
import { IntegrationsUrls } from "AppUrls";
import AzureDevopsIntegrationCreatePage from "./ticketing/AzureDevopsCreate";
import AzureDevopsIntegrationEditPage from "./ticketing/AzureDevopsEdit";
import JiraIntegrationCreatePage from "./ticketing/JiraCreate";
import JiraIntegrationEditPage from "./ticketing/JiraEdit";
import IntegrationsList from "./ticketing/List";
import WebhookCreatePage from "./webhooks/Create";
import WebhookEditPage from "./webhooks/Edit";
import WebhooksList from "./webhooks/List";

const IntegrationsRoutes: RouteObject[] = [
    {
        path: IntegrationsUrls.List,
        element: <SettingsLayout />,
        children: [
            { path: "ticketing", element: <IntegrationsList /> },
            { path: "jira/create", element: <JiraIntegrationCreatePage /> },
            { path: "jira/:integrationId/edit", element: <JiraIntegrationEditPage /> },
            { path: "azure-devops/create", element: <AzureDevopsIntegrationCreatePage /> },
            { path: "azure-devops/:integrationId/edit", element: <AzureDevopsIntegrationEditPage /> },
            { path: "api-tokens", element: <ApiTokensPage /> },
            {
                path: "webhooks",
                children: [
                    { index: true, element: <WebhooksList /> },
                    { path: "create", element: <WebhookCreatePage /> },
                    { path: ":webhookId/edit", element: <WebhookEditPage /> },
                ],
            },
        ],
    },
];

export default IntegrationsRoutes;
