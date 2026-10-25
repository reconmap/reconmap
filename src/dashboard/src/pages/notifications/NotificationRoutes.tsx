import type { RouteObject } from "react-router";
import NotificationsListPage from "pages/notifications/NotificationsListPage";

const NotificationRoutes: RouteObject[] = [{ path: "/notifications", element: <NotificationsListPage /> }];

export default NotificationRoutes;
