import ProjectsLayout from "layouts/ProjectsLayout";
import type { RouteObject } from "react-router";
import ReportTemplatesListPage from "./ReportTemplatesListPage";

const ReportTemplateRoutes: RouteObject[] = [
    {
        path: "/reports/templates",
        element: <ProjectsLayout />,
        children: [{ index: true, element: <ReportTemplatesListPage /> }],
    },
];

export default ReportTemplateRoutes;
