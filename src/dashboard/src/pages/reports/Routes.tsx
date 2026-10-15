import ProjectsLayout from "layouts/Layout";
import ReportsList from "pages/reports/List";
import SendReport from "pages/reports/Send";
import type { RouteObject } from "react-router";

const ReportsRoutes: RouteObject[] = [
    {
        path: "/reports",
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <ReportsList /> },
            { path: ":reportId/send", element: <SendReport /> },
        ],
    },
];

export default ReportsRoutes;
