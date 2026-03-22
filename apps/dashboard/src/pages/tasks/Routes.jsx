import ProjectsLayout from "components/projects/Layout";
import TaskCreationPage from "pages/tasks/Create";
import EditTaskPage from "pages/tasks/Edit";
import { Route } from "react-router-dom";
import TaskDetailsPage from "./Details.jsx";
import TasksListPage from "./List.jsx";

const TasksRoutes = [
    <Route path="/tasks" element={<ProjectsLayout />}>
        <Route index element={<TasksListPage />} />,
        <Route path={`create`} element={<TaskCreationPage />} />,
        <Route path={`:taskId`} element={<TaskDetailsPage />} />,
        <Route path={`:taskId/edit`} element={<EditTaskPage />} />,
    </Route>,
];

export default TasksRoutes;
