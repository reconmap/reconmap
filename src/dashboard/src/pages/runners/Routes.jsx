import { Route } from "react-router-dom";

import SettingsLayout from "layouts/SettingsLayout.jsx";
import { RunnersUrls } from "AppUrls";
import RunnerDetailsPage from "./Details.jsx";
import RunnersListPage from "./List.jsx";

const RunnerRoutes = [
    <Route path={RunnersUrls.List} element={<SettingsLayout />}>
        <Route index element={<RunnersListPage />} />,
        <Route path={`:runnerId`} element={<RunnerDetailsPage />} />,
    </Route>,
];

export default RunnerRoutes;
