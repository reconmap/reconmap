import VaultItemEdit from "components/projects/vault/VaultItemEdit";
import ToolsLayout from "layouts/ToolsLayout";
import { Route } from "react-router";
import { ToolsUrls } from "AppUrls";

const ToolsRoutes = [
    <Route element={<ToolsLayout />}>
        <Route path={ToolsUrls.VaultItemEdit} element={<VaultItemEdit />} />
    </Route>
];

export default ToolsRoutes;
