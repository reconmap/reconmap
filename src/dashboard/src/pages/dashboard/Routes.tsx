import { Route } from "react-router-dom";
import { DashboardUrls } from "AppUrls";
import DashboardPage from "./DashboardPage";

const DashboardRoutes = [<Route path={DashboardUrls.Default} element={<DashboardPage />} index />];

export default DashboardRoutes;
