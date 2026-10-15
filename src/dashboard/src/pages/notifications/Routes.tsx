import { Route } from "react-router";
import NotificationsList from "pages/notifications/List";

const NotificationsRoutes = [
    <Route path={`/notifications`} element={<NotificationsList />} />,
];

export default NotificationsRoutes;
