import ProjectsLayout from "layouts/Layout";
import TaskCreationPage from "pages/tasks/Create";
import EditTaskPage from "pages/tasks/Edit";
import type { RouteObject } from "react-router";
import { TasksUrls } from "AppUrls";
import TaskDetailsPage from "./Details";
import TasksListPage from "./List";

const TasksRoutes: RouteObject[] = [
    {
        path: TasksUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <TasksListPage /> },
            { path: "create", element: <TaskCreationPage /> },
            { path: ":taskId", element: <TaskDetailsPage /> },
            { path: ":taskId/edit", element: <EditTaskPage /> },
        ],
    },
];

export default TasksRoutes;
