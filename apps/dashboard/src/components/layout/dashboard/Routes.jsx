import { Route } from "react-router-dom";
import DashboardPage from "./DashboardPage.jsx";

const DashboardUrls = {
    DEFAULT: "/",
};

export { DashboardUrls };

const DashboardRoutes = [<Route path={DashboardUrls.DEFAULT} element={<DashboardPage />} index />];

export default DashboardRoutes;
