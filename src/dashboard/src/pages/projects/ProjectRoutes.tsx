import ProjectMembershipPage from "pages/projects/ProjectMembershipPage";

import { ProjectsUrls } from "AppUrls";
import ProjectsLayout from "layouts/ProjectsLayout";
import ProjectCreatePage from "pages/projects/ProjectCreatePage";
import ProjectDetailsPage from "pages/projects/ProjectDetailsPage";
import ProjectEditPage from "pages/projects/ProjectEditPage";
import ReportSendPage from "pages/reports/ReportSendPage";
import TaskCreatePage from "pages/tasks/TaskCreatePage";
import type { RouteObject } from "react-router";
import ProjectsListPage from "./ProjectsListPage";

const ProjectRoutes: RouteObject[] = [
    {
        path: ProjectsUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <ProjectsListPage /> },
            { path: "create", element: <ProjectCreatePage /> },
            { path: ":projectId/edit", element: <ProjectEditPage /> },
            { path: ":projectId/report/send", element: <ReportSendPage /> },
            { path: ":projectId/membership", element: <ProjectMembershipPage /> },
            { path: ":projectId/tasks/create", element: <TaskCreatePage /> },
            { path: ":projectId", element: <ProjectDetailsPage /> },
        ],
    },
];

export default ProjectRoutes;
