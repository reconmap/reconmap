import { Route } from "react-router-dom";
import PasswordGeneratorPage from "./PasswordGeneratorPage.jsx";
import VaultPage from "./VaultPage.jsx";
import ToolsLayout from "./ToolsLayout.jsx";

const ToolsUrls = {
    Vault: "/tools/vault",
    PasswordGenerator: "/tools/password-generator",
};

export { ToolsUrls };

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.Vault} element={<VaultPage />} />
        <Route path={ToolsUrls.PasswordGenerator} element={<PasswordGeneratorPage />} />
    </Route>
];

export default ToolsRoutes;
