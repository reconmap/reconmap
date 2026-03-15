import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Compose from "components/Compose";
import AgentRoutes from "components/agents/AgentsRoutes.jsx";
import DashboardRoutes from "components/layout/dashboard/Routes";
import NotificationsRoutes from "components/notifications/Routes";
import SettingsRoutes from "components/settings/Routes";
import ToolsRoutes from "components/tools/Routes.jsx";
import WebsocketProvider from "contexts/WebsocketContext";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Configuration from "./Configuration";
import ClientsRoutes from "./components/clients/Routes";
import CommandsRoutes from "./components/commands/Routes";
import DocumentsRoutes from "./components/documents/Routes";
import DashboardLayout from "./components/layout/DashboardLayout";
import PageNotFound from "./components/layout/dashboard/PageNotFound";
import ProjectsRoutes from "./components/projects/Routes";
import ProjectTemplatesRoutes from "./components/projects/templates/Routes";
import ReportsRoutes from "./components/reports/Routes";
import ReportTemplatesRoutes from "./components/reports/templates/Routes";
import SearchRoutes from "./components/search/Routes";
import SupportRoutes from "./components/support/Routes";
import SystemRoutes from "./components/system/Routes";
import TargetRoutes from "./components/target/Routes";
import TasksRoutes from "./components/tasks/Routes";
import UsersRoutes from "./components/users/Routes";
import VulnerabilitiesRoutes from "./components/vulnerabilities/Routes";
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
                                ...ProjectTemplatesRoutes,
                                ...ProjectsRoutes,
                                ...ReportTemplatesRoutes,
                                ...ReportsRoutes,
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
