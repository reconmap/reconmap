import SettingsLayout from "layouts/SettingsLayout";
import ClientCreate from "pages/clients/Create";
import ClientDetails from "pages/clients/Details";
import EditClientPage from "pages/clients/Edit";
import ClientsList from "pages/clients/List";
import type { RouteObject } from "react-router";
import { ClientsUrls } from "AppUrls";

const ClientsRoutes: RouteObject[] = [
    {
        path: ClientsUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <ClientsList /> },
            { path: "create", element: <ClientCreate /> },
            { path: ":clientId", element: <ClientDetails /> },
            { path: ":clientId/edit", element: <EditClientPage /> },
        ],
    },
];

export default ClientsRoutes;
