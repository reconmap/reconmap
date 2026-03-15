import SettingsLayout from "components/settings/SettingsLayout";
import { Route } from "react-router-dom";
import CreateUserPage from "./Create";
import EditUserPage from "./Edit";
import UsersList from "./List";
import UserPreferences from "./Preferences";
import UserProfile from "./Profile";

const UsersRoutes = [
    <Route path={`/users`} element={<SettingsLayout />}>
        <Route index element={<UsersList />} />,
        <Route path={`preferences`} element={<UserPreferences />} />,
        <Route path={`create`} element={<CreateUserPage />} />,
        <Route path={`:userId`} element={<UserProfile />} />,
        <Route path={`:userId/edit`} element={<EditUserPage />} />,
    </Route>,
];

export default UsersRoutes;
