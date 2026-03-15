import SendReport from "components/reports/Send";
import { Route } from "react-router-dom";
import TaskCreationPage from "../tasks/Create";
import ProjectCreateForm from "./Create";
import ProjectDetails from "./Details";
import ProjectEdit from "./Edit";
import ProjectsLayout from "./Layout.jsx";
import ProjectMembership from "./Membership";
import ProjectsListPage from "./ProjectsListPage";
import ProjectReport from "./Report";
import VaultItemEdit from "./vault/VaultItemEdit";

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
    <Route path={`/vault/:vaultItemId/edit`} element={<VaultItemEdit />} />,
];

export default ProjectsRoutes;
