import ProjectsLayout from "components/projects/Layout.jsx";
import { Route } from "react-router-dom";
import ReportsList from "./List";
import SendReport from "./Send";

const ReportsRoutes = [
    <Route path={`/reports`} element={<ProjectsLayout />}>
        <Route index element={<ReportsList />} />,
        <Route path={`:reportId/send`} element={<SendReport />} />,
    </Route>,
];

export default ReportsRoutes;
