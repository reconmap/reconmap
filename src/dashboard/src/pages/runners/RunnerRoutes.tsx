import type { RouteObject } from "react-router";

import SettingsLayout from "layouts/SettingsLayout";
import { RunnersUrls } from "AppUrls";
import RunnerCreatePage from "./RunnerCreatePage";
import RunnerDetailsPage from "./RunnerDetailsPage";
import RunnersListPage from "./RunnersListPage";

const RunnerRoutes: RouteObject[] = [
    {
        path: RunnersUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <RunnersListPage /> },
            { path: "create", element: <RunnerCreatePage /> },
            { path: ":runnerId", element: <RunnerDetailsPage /> },
        ],
    },
];

export default RunnerRoutes;
