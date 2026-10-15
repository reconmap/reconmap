import ProjectsLayout from "layouts/Layout";
import type { RouteObject } from "react-router";
import ReportTemplatesList from "./List";

const ReportTemplatesRoutes: RouteObject[] = [
    {
        path: "/reports/templates",
        element: <ProjectsLayout />,
        children: [{ index: true, element: <ReportTemplatesList /> }],
    },
];

export default ReportTemplatesRoutes;
