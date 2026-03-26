import { Route } from "react-router-dom";

import SettingsLayout from "layouts/SettingsLayout.jsx";
import { AgentsUrls } from "AppUrls";
import AgentDetailsPage from "./Details.jsx";
import AgentsListPage from "./List.jsx";

const AgentRoutes = [
    <Route path={AgentsUrls.List} element={<SettingsLayout />}>
        <Route index element={<AgentsListPage />} />,
        <Route path={`:agentId`} element={<AgentDetailsPage />} />,
    </Route>,
];

export default AgentRoutes;
