import { Route } from "react-router-dom";
import CustomFieldsPage from "components/settings/CustomFields/Form";
import SettingsLayout from "components/settings/SettingsLayout";

const SettingsRoutes = [
    <Route path="/settings" element={<SettingsLayout />}>
        <Route path={`custom-fields`} element={<CustomFieldsPage />} />,
    </Route>,
];

export default SettingsRoutes;
