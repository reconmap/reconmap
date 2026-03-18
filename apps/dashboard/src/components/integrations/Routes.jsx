import { Route } from "react-router-dom";
import IntegrationsListPage from "./List";
import JiraIntegrationCreatePage from "./JiraCreate";
import JiraIntegrationEditPage from "./JiraEdit";

const IntegrationsRoutes = [
    <Route path="/integrations" key="integrations-list" element={<IntegrationsListPage />} />,
    <Route path="/integrations/jira/create" key="integrations-jira-create" element={<JiraIntegrationCreatePage />} />,
    <Route path="/integrations/jira/:integrationId/edit" key="integrations-jira-edit" element={<JiraIntegrationEditPage />} />,
];

export default IntegrationsRoutes;
