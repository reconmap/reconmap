import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Compose from "components/logic/Compose";
import SseProvider from "contexts/SseContext";
import DashboardLayout from "layouts/DashboardLayout";
import PageNotFound from "pages/PageNotFound";
import RunnerRoutes from "pages/runners/Routes";
import ClientsRoutes from "pages/clients/Routes";
import DashboardRoutes from "pages/dashboard/Routes";
import IntegrationsRoutes from "pages/integrations/Routes";
import NotificationsRoutes from "pages/notifications/Routes";
import ProjectsRoutes from "pages/projects/Routes";
import ReportsRoutes from "pages/reports/Routes";
import ReportTemplatesRoutes from "pages/reports/templates/Routes";
import ScansRoutes from "pages/scans/Routes";
import SearchRoutes from "pages/search/Routes";
import SettingsRoutes from "pages/settings/Routes";
import SupportRoutes from "pages/support/Routes";
import SystemRoutes from "pages/system/Routes";
import AssetRoutes from "pages/asset/Routes";
import TasksRoutes from "pages/tasks/Routes";
import ToolsRoutes from "pages/tools/Routes";
import UsersRoutes from "pages/users/Routes";
import VulnerabilitiesRoutes from "pages/vulnerabilities/Routes";
import { createBrowserRouter, Outlet, type RouteObject } from "react-router";
import { RouterProvider } from "react-router/dom";
import Configuration from "./Configuration";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "components/ui/ErrorBoundary";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * (60 * 1000), // 2 mins
            gcTime: 5 * (60 * 1000), // 5 mins
        },
    },
});

const routes: RouteObject[] = [
    // Order of provider components matters
    {
        element: (
            <Compose components={[AuthProvider, SseProvider]}>
                <Outlet />
            </Compose>
        ),
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    ...DashboardRoutes,
                    ...ClientsRoutes,
                    ...ProjectsRoutes,
                    ...ReportTemplatesRoutes,
                    ...ReportsRoutes,
                    ...ScansRoutes,
                    ...NotificationsRoutes,
                    ...SearchRoutes,
                    ...SettingsRoutes,
                    ...SupportRoutes,
                    ...SystemRoutes,
                    ...AssetRoutes,
                    ...TasksRoutes,
                    ...ToolsRoutes,
                    ...RunnerRoutes,
                    ...UsersRoutes,
                    ...VulnerabilitiesRoutes,
                    ...IntegrationsRoutes,
                    { path: "*", element: <PageNotFound /> },
                ],
            },
        ],
    },
];

// Data routers must be created once, outside of the React tree.
// window.env is populated before this module is loaded (see index.html).
const router = createBrowserRouter(routes, { basename: Configuration.getContextPath() });

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </QueryClientProvider>
    );
};

export default App;
