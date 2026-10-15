import ProjectsLayout from "layouts/Layout";
import TaskCreationPage from "pages/tasks/Create";
import EditTaskPage from "pages/tasks/Edit";
import { Route } from "react-router";
import { TasksUrls } from "AppUrls";
import TaskDetailsPage from "./Details";
import TasksListPage from "./List";

const TasksRoutes = [
    <Route path={TasksUrls.List} element={<ProjectsLayout />}>
        <Route index element={<TasksListPage />} />,
        <Route path={`create`} element={<TaskCreationPage />} />,
        <Route path={`:taskId`} element={<TaskDetailsPage />} />,
        <Route path={`:taskId/edit`} element={<EditTaskPage />} />,
    </Route>,
];

export default TasksRoutes;
