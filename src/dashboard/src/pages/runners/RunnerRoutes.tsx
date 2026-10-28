import type { RouteObject } from "react-router";

import SettingsLayout from "layouts/SettingsLayout";
import { RunnersUrls } from "AppUrls";
import RunnerDetailsPage from "./RunnerDetailsPage";
import RunnersListPage from "./RunnersListPage";

const RunnerRoutes: RouteObject[] = [
    {
        path: RunnersUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <RunnersListPage /> },
            { path: ":runnerId", element: <RunnerDetailsPage /> },
        ],
    },
];

export default RunnerRoutes;
