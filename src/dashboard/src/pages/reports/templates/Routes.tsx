import ProjectsLayout from "layouts/Layout";
import { Route } from "react-router";
import ReportTemplatesList from "./List";

const ReportTemplatesRoutes = [
    <Route path={`/reports/templates`} element={<ProjectsLayout />}>
        <Route index element={<ReportTemplatesList />} />,
    </Route>,
];

export default ReportTemplatesRoutes;
