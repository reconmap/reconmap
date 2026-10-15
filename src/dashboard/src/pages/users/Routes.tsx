import SettingsLayout from "layouts/SettingsLayout";
import CreateUserPage from "pages/users/Create";
import EditUserPage from "pages/users/Edit";
import UsersList from "pages/users/List";
import UserProfile from "pages/users/Profile";
import type { RouteObject } from "react-router";
import { UsersUrls } from "AppUrls";

const UsersRoutes: RouteObject[] = [
    {
        path: UsersUrls.List,
        element: <SettingsLayout />,
        children: [
            { index: true, element: <UsersList /> },
            { path: "create", element: <CreateUserPage /> },
            { path: ":userId", element: <UserProfile /> },
            { path: ":userId/edit", element: <EditUserPage /> },
        ],
    },
];

export default UsersRoutes;
