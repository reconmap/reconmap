import { Route } from "react-router-dom";

import SettingsLayout from "layouts/SettingsLayout.jsx";
import { RunnersUrls } from "AppUrls";
import RunnerCreatePage from "./Create.jsx";
import RunnerDetailsPage from "./Details.jsx";
import RunnersListPage from "./List.jsx";

const RunnerRoutes = [
    <Route path={RunnersUrls.List} element={<SettingsLayout />}>
        <Route index element={<RunnersListPage />} />
        <Route path="create" element={<RunnerCreatePage />} />
        <Route path=":runnerId" element={<RunnerDetailsPage />} />
    </Route>,
];

export default RunnerRoutes;
