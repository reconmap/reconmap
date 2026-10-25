import ProjectsLayout from "layouts/ProjectsLayout";
import ReportsListPage from "pages/reports/ReportsListPage";
import ReportSendPage from "pages/reports/ReportSendPage";
import type { RouteObject } from "react-router";

const ReportRoutes: RouteObject[] = [
    {
        path: "/reports",
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <ReportsListPage /> },
            { path: ":reportId/send", element: <ReportSendPage /> },
        ],
    },
];

export default ReportRoutes;
