import { Route } from "react-router-dom";
import ProjectsLayout from "../Layout.jsx";
import TemplateDetails from "./Details";
import TemplatesList from "./List";

const ProjectTemplatesRoutes = [
    <Route path={`/projects/templates`} element={<ProjectsLayout />}>
        <Route index element={<TemplatesList />} />,
        <Route path={`:templateId`} element={<TemplateDetails />} />
    </Route>,
];

export default ProjectTemplatesRoutes;
