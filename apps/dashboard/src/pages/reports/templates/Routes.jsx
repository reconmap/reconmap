import ProjectsLayout from "components/projects/Layout";
import { Route } from "react-router-dom";
import ReportTemplatesList from "./List";

const ReportTemplatesRoutes = [
    <Route path={`/reports/templates`} element={<ProjectsLayout />}>
        <Route index element={<ReportTemplatesList />} />,
    </Route>,
];

export default ReportTemplatesRoutes;
