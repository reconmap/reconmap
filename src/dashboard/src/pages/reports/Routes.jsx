import ProjectsLayout from "layouts/Layout.jsx";
import ReportsList from "pages/reports/List";
import SendReport from "pages/reports/Send";
import { Route } from "react-router-dom";

const ReportsRoutes = [
    <Route path={`/reports`} element={<ProjectsLayout />}>
        <Route index element={<ReportsList />} />,
        <Route path={`:reportId/send`} element={<SendReport />} />,
    </Route>,
];

export default ReportsRoutes;
