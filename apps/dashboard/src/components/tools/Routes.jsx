import { Route } from "react-router-dom";
import PasswordGeneratorPage from "./PasswordGeneratorPage.jsx";
import VaultPage from "./VaultPage.jsx";

const ToolsUrls = {
    Vault: "/tools/vault",
    PasswordGenerator: "/tools/password-generator",
};

export { ToolsUrls };

const ToolsRoutes = [
    <Route path={ToolsUrls.Vault} element={<VaultPage />} />,
    <Route path={ToolsUrls.PasswordGenerator} element={<PasswordGeneratorPage />} />,
];

export default ToolsRoutes;
