import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Compose from "components/logic/Compose";
import SseProvider from "contexts/SseContext";
import DashboardLayout from "layouts/DashboardLayout";
import PageNotFound from "pages/PageNotFound";
import RunnerRoutes from "pages/runners/RunnerRoutes";
import ClientRoutes from "pages/clients/ClientRoutes";
import DashboardRoutes from "pages/dashboard/DashboardRoutes";
import IntegrationRoutes from "pages/integrations/IntegrationRoutes";
import NotificationRoutes from "pages/notifications/NotificationRoutes";
import ProjectRoutes from "pages/projects/ProjectRoutes";
import ReportRoutes from "pages/reports/ReportRoutes";
import ReportTemplateRoutes from "pages/reports/templates/ReportTemplateRoutes";
import ScanRoutes from "pages/scans/ScanRoutes";
import SearchRoutes from "pages/search/SearchRoutes";
import SettingsRoutes from "pages/settings/SettingsRoutes";
import SupportRoutes from "pages/support/SupportRoutes";
import SystemRoutes from "pages/system/SystemRoutes";
import AssetRoutes from "pages/asset/AssetRoutes";
import TaskRoutes from "pages/tasks/TaskRoutes";
import ToolsRoutes from "pages/tools/ToolsRoutes";
import UserRoutes from "pages/users/UserRoutes";
import VulnerabilityRoutes from "pages/vulnerabilities/VulnerabilityRoutes";
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
                    ...ClientRoutes,
                    ...ProjectRoutes,
                    ...ReportTemplateRoutes,
                    ...ReportRoutes,
                    ...ScanRoutes,
                    ...NotificationRoutes,
                    ...SearchRoutes,
                    ...SettingsRoutes,
                    ...SupportRoutes,
                    ...SystemRoutes,
                    ...AssetRoutes,
                    ...TaskRoutes,
                    ...ToolsRoutes,
                    ...RunnerRoutes,
                    ...UserRoutes,
                    ...VulnerabilityRoutes,
                    ...IntegrationRoutes,
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
