import type { RouteObject } from "react-router";
import NotificationsList from "pages/notifications/List";

const NotificationsRoutes: RouteObject[] = [{ path: "/notifications", element: <NotificationsList /> }];

export default NotificationsRoutes;
