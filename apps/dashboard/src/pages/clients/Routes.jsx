import SettingsLayout from "components/settings/SettingsLayout";
import ClientCreate from "pages/clients/Create";
import ClientDetails from "pages/clients/Details";
import EditClientPage from "pages/clients/Edit";
import ClientsList from "pages/clients/List";
import { Route } from "react-router-dom";
import OrganisationsUrls from "./Urls.js";

const ClientsRoutes = [
    <Route path={OrganisationsUrls.List} element={<SettingsLayout />}>
        <Route index element={<ClientsList />} />
        <Route path={`create`} element={<ClientCreate />} />,
        <Route path={`:clientId`} element={<ClientDetails />} />,
        <Route path={`:clientId/edit`} element={<EditClientPage />} />,
    </Route>,
];

export default ClientsRoutes;
