import VaultItemEdit from "components/projects/vault/VaultItemEdit";
import ToolsLayout from "layouts/ToolsLayout.jsx";
import { Route } from "react-router-dom";
import { ToolsUrls } from "AppUrls";

import VaultPage from "./Vault.jsx";

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.Vault} element={<VaultPage />} />
        <Route path={ToolsUrls.VaultItemEdit} element={<VaultItemEdit />} />
    </Route>
];

export default ToolsRoutes;
