import { Route } from "react-router";

import SettingsLayout from "layouts/SettingsLayout";
import { RunnersUrls } from "AppUrls";
import RunnerCreatePage from "./Create";
import RunnerDetailsPage from "./Details";
import RunnersListPage from "./List";

const RunnerRoutes = [
    <Route path={RunnersUrls.List} element={<SettingsLayout />}>
        <Route index element={<RunnersListPage />} />
        <Route path="create" element={<RunnerCreatePage />} />
        <Route path=":runnerId" element={<RunnerDetailsPage />} />
    </Route>,
];

export default RunnerRoutes;
