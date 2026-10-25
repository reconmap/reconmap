import type { RouteObject } from "react-router";
import { DashboardUrls } from "AppUrls";
import DashboardPage from "./DashboardPage";

const DashboardRoutes: RouteObject[] = [{ path: DashboardUrls.Default, element: <DashboardPage />, index: true }];

export default DashboardRoutes;
