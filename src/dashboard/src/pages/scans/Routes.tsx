import ScansLayout from "layouts/ScansLayout";
import { Navigate, type RouteObject } from "react-router";
import { ScansUrls } from "AppUrls";
import ScansPage from "./List";

const ScansRoutes: RouteObject[] = [
    {
        path: ScansUrls.List,
        element: <ScansLayout />,
        children: [
            { index: true, element: <Navigate to="run-once" /> },
            { path: "run-once", element: <ScansPage mode="once" /> },
            { path: "schedules", element: <ScansPage mode="schedules" /> },
            { path: "import", element: <ScansPage mode="import" /> },
        ],
    },
];

export default ScansRoutes;
