import SupportForm from "components/support/Form";
import HelpSupportLayout from "layouts/HelpSupportLayout";
import type { RouteObject } from "react-router";

const SupportRoutes: RouteObject[] = [
    {
        element: <HelpSupportLayout />,
        children: [{ path: "/support", element: <SupportForm /> }],
    },
];

export default SupportRoutes;
