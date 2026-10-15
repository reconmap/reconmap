import ProjectMembership from "components/projects/Membership";

import { ProjectsUrls } from "AppUrls";
import ProjectsLayout from "layouts/Layout";
import ProjectCreateForm from "pages/projects/Create";
import ProjectDetails from "pages/projects/Details";
import ProjectEdit from "pages/projects/Edit";
import SendReport from "pages/reports/Send";
import TaskCreationPage from "pages/tasks/Create";
import type { RouteObject } from "react-router";
import ProjectsListPage from "./List";

const ProjectsRoutes: RouteObject[] = [
    {
        path: ProjectsUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <ProjectsListPage /> },
            { path: "create", element: <ProjectCreateForm /> },
            { path: ":projectId/edit", element: <ProjectEdit /> },
            { path: ":projectId/report/send", element: <SendReport /> },
            { path: ":projectId/membership", element: <ProjectMembership /> },
            { path: ":projectId/tasks/create", element: <TaskCreationPage /> },
            { path: ":projectId", element: <ProjectDetails /> },
        ],
    },
];

export default ProjectsRoutes;
