import SettingsLayout from "layouts/SettingsLayout";
import UserCreatePage from "pages/users/UserCreatePage";
import UserEditPage from "pages/users/UserEditPage";
import UsersListPage from "pages/users/UsersListPage";
import UserProfilePage from "pages/users/UserProfilePage";
import type { RouteObject } from "react-router";
import { UsersUrls } from "AppUrls";

const UserRoutes: RouteObject[] = [
    {
        path: UsersUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <UsersListPage /> },
            { path: "create", element: <UserCreatePage /> },
            { path: ":userId", element: <UserProfilePage /> },
            { path: ":userId/edit", element: <UserEditPage /> },
        ],
    },
];

export default UserRoutes;
