import { Route } from "react-router-dom";
import VaultItemEdit from "../projects/vault/VaultItemEdit";
import PasswordGeneratorPage from "./PasswordGeneratorPage.jsx";
import ToolsLayout from "./ToolsLayout.jsx";
import VaultPage from "./VaultPage.jsx";

import { ToolsUrls } from "./ToolsUrls";

export { ToolsUrls };

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.Vault} element={<VaultPage />} />
        <Route path={ToolsUrls.PasswordGenerator} element={<PasswordGeneratorPage />} />
        <Route path={`/vault/:vaultItemId/edit`} element={<VaultItemEdit />} />
    </Route>
];

export default ToolsRoutes;
