import type { RouteObject } from "react-router";

import SettingsLayout from "layouts/SettingsLayout";
import { RunnersUrls } from "AppUrls";
import RunnerCreatePage from "./Create";
import RunnerDetailsPage from "./Details";
import RunnersListPage from "./List";

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
