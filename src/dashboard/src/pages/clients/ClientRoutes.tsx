import SettingsLayout from "layouts/SettingsLayout";
import ClientCreatePage from "pages/clients/ClientCreatePage";
import ClientDetailsPage from "pages/clients/ClientDetailsPage";
import ClientEditPage from "pages/clients/ClientEditPage";
import ClientsListPage from "pages/clients/ClientsListPage";
import type { RouteObject } from "react-router";
import { ClientsUrls } from "AppUrls";

const ClientRoutes: RouteObject[] = [
    {
        path: ClientsUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <ClientsListPage /> },
            { path: "create", element: <ClientCreatePage /> },
            { path: ":clientId", element: <ClientDetailsPage /> },
            { path: ":clientId/edit", element: <ClientEditPage /> },
        ],
    },
];

export default ClientRoutes;
