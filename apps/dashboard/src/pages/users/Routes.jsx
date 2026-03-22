import SettingsLayout from "components/settings/SettingsLayout";
import { Route } from "react-router-dom";
import CreateUserPage from "pages/users/Create";
import EditUserPage from "pages/users/Edit";
import UsersList from "pages/users/List";
import UserPreferences from "pages/users/Preferences";
import UserProfile from "pages/users/Profile";

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
