import VaultItemEdit from "components/projects/vault/VaultItemEdit";
import ToolsLayout from "layouts/ToolsLayout.jsx";
import { Route } from "react-router-dom";

import PasswordGeneratorPage from "./PasswordGenerator.jsx";
import { ToolsUrls } from "./Urls.js";
import VaultPage from "./Vault.jsx";

export { ToolsUrls };

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.Vault} element={<VaultPage />} />
        <Route path={ToolsUrls.PasswordGenerator} element={<PasswordGeneratorPage />} />
        <Route path={`/vault/:vaultItemId/edit`} element={<VaultItemEdit />} />
    </Route>
];

export default ToolsRoutes;
