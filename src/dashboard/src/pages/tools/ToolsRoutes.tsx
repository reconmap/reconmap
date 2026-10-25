import VaultItemEditPage from "pages/tools/VaultItemEditPage";
import ToolsLayout from "layouts/ToolsLayout";
import type { RouteObject } from "react-router";
import { ToolsUrls } from "AppUrls";

const ToolsRoutes: RouteObject[] = [
    {
        element: <ToolsLayout />,
        children: [{ path: ToolsUrls.VaultItemEdit, element: <VaultItemEditPage /> }],
    },
];

export default ToolsRoutes;
