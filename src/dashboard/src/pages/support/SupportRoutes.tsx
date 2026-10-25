import SupportPage from "pages/support/SupportPage";
import HelpSupportLayout from "layouts/HelpSupportLayout";
import type { RouteObject } from "react-router";

const SupportRoutes: RouteObject[] = [
    {
        element: <HelpSupportLayout />,
        children: [{ path: "/support", element: <SupportPage /> }],
    },
];

export default SupportRoutes;
