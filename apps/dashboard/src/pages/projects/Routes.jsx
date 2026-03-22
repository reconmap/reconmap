import ProjectsLayout from "components/projects/Layout.jsx";
import ProjectMembership from "components/projects/Membership";
import ProjectReport from "components/projects/Report";
import ProjectCreateForm from "pages/projects/Create";
import ProjectDetails from "pages/projects/Details";
import ProjectEdit from "pages/projects/Edit";
import SendReport from "pages/reports/Send";
import TaskCreationPage from "pages/tasks/Create";
import { Route } from "react-router-dom";
import ProjectsListPage from "./List.jsx";

const ProjectsRoutes = [
    <Route path="/projects" element={<ProjectsLayout />}>
        <Route index element={<ProjectsListPage />} />,
        <Route path={`create`} element={<ProjectCreateForm />} />,
        <Route path={`:projectId/edit`} element={<ProjectEdit />} />,
        <Route path={`:projectId/report`} element={<ProjectReport />} />,
        <Route path={`:projectId/report/send`} element={<SendReport />} />,
        <Route path={`:projectId/membership`} element={<ProjectMembership />} />,
        <Route path={`:projectId/tasks/create`} element={<TaskCreationPage />} />,
        <Route path={`:projectId`} element={<ProjectDetails />} />,
    </Route>,
];

export default ProjectsRoutes;
