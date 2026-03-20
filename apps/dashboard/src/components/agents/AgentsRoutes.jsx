import ToolsLayout from "components/tools/ToolsLayout";
import { Route } from "react-router-dom";
import AgentDetailsPage from "./AgentDetailsPage.jsx";
import AgentsListPage from "./AgentsListPage.jsx";

import { AgentsUrls } from "./AgentsUrls";

export { AgentsUrls };

const AgentRoutes = [
    <Route path={AgentsUrls.List} element={<ToolsLayout />}>
        <Route index element={<AgentsListPage />} />,
        <Route path={`:agentId`} element={<AgentDetailsPage />} />,
    </Route>,
];

export default AgentRoutes;
