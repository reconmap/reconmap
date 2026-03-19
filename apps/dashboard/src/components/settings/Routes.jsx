import { Route } from "react-router-dom";
import CustomFieldsPage from "./CustomFields/Form";
import SettingsLayout from "./SettingsLayout";

const SettingsRoutes = [
    <Route path="/settings" element={<SettingsLayout />}>
        <Route path={`custom-fields`} element={<CustomFieldsPage />} />,
    </Route>,
];

export default SettingsRoutes;
