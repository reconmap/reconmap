import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Compose from "components/logic/Compose.jsx";
import WebsocketProvider from "contexts/WebsocketContext";
import DashboardLayout from "layouts/DashboardLayout.jsx";
import PageNotFound from "pages/PageNotFound.jsx";
import AgentRoutes from "pages/agents/Routes";
import ClientsRoutes from "pages/clients/Routes";
import CommandsRoutes from "pages/commands/Routes";
import DashboardRoutes from "pages/dashboard/Routes.jsx";
import DocumentsRoutes from "pages/documents/Routes";
import IntegrationsRoutes from "pages/integrations/Routes";
import NotificationsRoutes from "pages/notifications/Routes";
import ProjectsRoutes from "pages/projects/Routes";
import ReportsRoutes from "pages/reports/Routes";
import ReportTemplatesRoutes from "pages/reports/templates/Routes.jsx";
import ScansRoutes from "pages/scans/Routes";
import SearchRoutes from "pages/search/Routes";
import SettingsRoutes from "pages/settings/Routes";
import SupportRoutes from "pages/support/Routes";
import SystemRoutes from "pages/system/Routes";
import TargetRoutes from "pages/target/Routes";
import TasksRoutes from "pages/tasks/Routes";
import ToolsRoutes from "pages/tools/Routes";
import UsersRoutes from "pages/users/Routes";
import VulnerabilitiesRoutes from "pages/vulnerabilities/Routes";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Configuration from "./Configuration";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * (60 * 1000), // 2 mins
            cacheTime: 5 * (60 * 1000), // 5 mins
        },
    },
});

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter basename={Configuration.getContextPath()}>
                {/* Order of provider components matters */}
                <Compose components={[AuthProvider, WebsocketProvider]}>
                    <Routes>
                        <Route element={<DashboardLayout />}>
                            {[
                                ...DashboardRoutes,
                                ...ClientsRoutes,
                                ...CommandsRoutes,
                                ...DocumentsRoutes,
                                ...ProjectsRoutes,
                                ...ReportTemplatesRoutes,
                                ...ReportsRoutes,
                                ...ScansRoutes,
                                ...NotificationsRoutes,
                                ...SearchRoutes,
                                ...SettingsRoutes,
                                ...SupportRoutes,
                                ...SystemRoutes,
                                ...TargetRoutes,
                                ...TasksRoutes,
                                ...ToolsRoutes,
                                ...AgentRoutes,
                                ...UsersRoutes,
                                ...VulnerabilitiesRoutes,
                                ...IntegrationsRoutes,
                            ].map((value, index) => React.cloneElement(value, { key: `protected_route_${index}` }))}
                            <Route path="*" element={<PageNotFound />} />
                        </Route>
                    </Routes>
                </Compose>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
