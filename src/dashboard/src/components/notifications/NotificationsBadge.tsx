import { useQueryClient } from "@tanstack/react-query";
import { notificationsKey, useMarkNotificationMutation, useNotificationsQuery } from "api/notifications";
import NativeButton from "components/forms/NativeButton";
import CssIcon from "components/ui/CssIcon";
import Tag from "components/ui/Tag";
import { useSseMessage } from "contexts/SseContext";
import useToggle from "hooks/useToggle";
import { Link } from "react-router";

const NotificationsBadge = () => {
    const queryClient = useQueryClient();
    const { data: notifications, isLoading } = useNotificationsQuery({ status: "unread" });
    const markNotificationMutation = useMarkNotificationMutation();
    const { value, toggle, setToggle } = useToggle(false);

    const onMessageHandler = () => {
        queryClient.invalidateQueries({ queryKey: notificationsKey });
    };

    useSseMessage(onMessageHandler);

    const markAsRead = (notification) => {
        markNotificationMutation.mutate({ id: notification.id, status: "read" });
    };

    if (isLoading) {
        return null;
    }

    return (
        <div className={`dropdown ${value ? "is-active" : ""}`} onMouseLeave={() => setToggle(false)}>
            <div className="dropdown-trigger">
                <NativeButton
                    pr={null !== notifications && notifications.length > 0 ? 1 : 2}
                    variant="ghost"
                    aria-label="Notifications"
                    onClick={toggle}
                >
                    {null !== notifications && notifications.length > 0 && <Tag>{notifications.length}</Tag>}
                    <CssIcon name="bell" />
                </NativeButton>
            </div>
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    <div className="dropdown-item">
                        <Link to="/notifications">Notifications</Link>
                    </div>
                    <div className="dropdown-item">
                        {null !== notifications && notifications.length > 0 ? (
                            <div>
                                {notifications.map((notification) => (
                                    <div key={notification.id}>
                                        <div>
                                            <div>
                                                {notification.createdAt}<br />
                                                <NativeButton
                                                    className="delete is-smaxll"
                                                    position="absolute"
                                                    right="8px"
                                                    top="8px"
                                                    onClick={() => markAsRead(notification)}
                                                >
                                                </NativeButton>

                                                <strong>
                                                    <Link to="/vulnerabilities">{notification.title}</Link>
                                                </strong>
                                            </div>
                                            <div>{notification.content}</div>
                                        </div>
                                        <hr />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span>Nothing to see here.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsBadge;
