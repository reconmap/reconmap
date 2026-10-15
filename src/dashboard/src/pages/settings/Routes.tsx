import CustomFieldsPage from "components/settings/CustomFields/Form";
import SettingsLayout from "layouts/SettingsLayout";
import type { RouteObject } from "react-router";

const SettingsRoutes: RouteObject[] = [
    {
        path: "/settings",
        element: <SettingsLayout />,
        children: [{ path: "custom-fields", element: <CustomFieldsPage /> }],
    },
];

export default SettingsRoutes;
