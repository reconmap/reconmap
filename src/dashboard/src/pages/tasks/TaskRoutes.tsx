import ProjectsLayout from "layouts/ProjectsLayout";
import TaskCreatePage from "pages/tasks/TaskCreatePage";
import TaskEditPage from "pages/tasks/TaskEditPage";
import type { RouteObject } from "react-router";
import { TasksUrls } from "AppUrls";
import TaskDetailsPage from "./TaskDetailsPage";
import TasksListPage from "./TasksListPage";

const TaskRoutes: RouteObject[] = [
    {
        path: TasksUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <TasksListPage /> },
            { path: "create", element: <TaskCreatePage /> },
            { path: ":taskId", element: <TaskDetailsPage /> },
            { path: ":taskId/edit", element: <TaskEditPage /> },
        ],
    },
];

export default TaskRoutes;
