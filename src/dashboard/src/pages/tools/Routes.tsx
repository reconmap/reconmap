import VaultItemEdit from "components/projects/vault/VaultItemEdit";
import ToolsLayout from "layouts/ToolsLayout";
import type { RouteObject } from "react-router";
import { ToolsUrls } from "AppUrls";

const ToolsRoutes: RouteObject[] = [
    {
        element: <ToolsLayout />,
        children: [{ path: ToolsUrls.VaultItemEdit, element: <VaultItemEdit /> }],
    },
];

export default ToolsRoutes;
