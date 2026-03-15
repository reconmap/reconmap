import { Route } from "react-router-dom";
import NotificationsList from "./List";

const NotificationsRoutes = [
    <Route path={`/notifications`} element={<NotificationsList />} />,
];

export default NotificationsRoutes;
