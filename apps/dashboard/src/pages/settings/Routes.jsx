import CustomFieldsPage from "components/settings/CustomFields/Form";
import SettingsLayout from "layouts/SettingsLayout.jsx";
import { Route } from "react-router-dom";

const SettingsRoutes = [
    <Route path="/settings" element={<SettingsLayout />}>
        <Route path={`custom-fields`} element={<CustomFieldsPage />} />,
    </Route>,
];

export default SettingsRoutes;
