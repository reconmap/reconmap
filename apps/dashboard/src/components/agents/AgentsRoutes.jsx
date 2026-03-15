import ProjectsLayout from "components/projects/Layout";
import { Route } from "react-router-dom";
import AgentDetailsPage from "./AgentDetailsPage.jsx";
import AgentsListPage from "./AgentsListPage.jsx";

const AgentsUrls = {
    List: "/agents",
};

export { AgentsUrls };

const AgentRoutes = [
    <Route path={AgentsUrls.List} element={<ProjectsLayout />}>
        <Route index element={<AgentsListPage />} />,
        <Route path={`:agentId`} element={<AgentDetailsPage />} />,
    </Route>,
];

export default AgentRoutes;
