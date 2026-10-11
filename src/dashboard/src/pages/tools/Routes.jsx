import VaultItemEdit from "components/projects/vault/VaultItemEdit";
import ToolsLayout from "layouts/ToolsLayout.jsx";
import { Route } from "react-router-dom";
import { ToolsUrls } from "AppUrls";

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.VaultItemEdit} element={<VaultItemEdit />} />
    </Route>
];

export default ToolsRoutes;
