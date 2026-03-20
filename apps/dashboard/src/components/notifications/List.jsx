import { useDeleteNotificationMutation, useNotificationsQuery } from "api/notifications.js";
import { requestNotificationsPatch, requestPartialNotificationUpdate } from "api/requests/notifications.js";
import NativeButton from "components/form/NativeButton";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import Loading from "components/ui/Loading.jsx";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import Title from "components/ui/Title";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { actionCompletedToast } from "components/ui/toast.jsx";

const isUnread = (notification) => notification.status === "unread";

const NotificationsList = () => {
    const { data: notifications, refetch, isLoading } = useNotificationsQuery({});
    const deleteNotificatioMutation = useDeleteNotificationMutation();

    const markAllNotificationsAsRead = () => {
        requestNotificationsPatch({
            ids: notifications.filter(isUnread).map((n) => n.id),
            status: 'read'
        }).then(() => {
            refetch();
            actionCompletedToast("All notifications marked as read");
        });
    };

    const markNotificationAsRead = (notification) => {
        requestPartialNotificationUpdate(notification.id, { status: "read" }).then(() => {
            refetch();
        });
    };

    if (isLoading) return <Loading />;

    const columns = [
        {
            header: <>&nbsp;</>,
            cell: (notification) => (notification.status === "read" ? <>(read)</> : <>&nbsp;</>),
        },
        {
            header: "Date/time",
            cell: (notification) => <RelativeDateFormatter date={notification.createdAt} />,
        },
        {
            header: "Content",
            cell: (notification) => (
                <>
                    <strong>{notification.title}</strong>
                    <div>{notification.content}</div>
                </>
            ),
        },
        {
            header: <>&nbsp;</>,
            cell: (notification) => (
                <NativeButtonGroup>
                    {notification.status === "unread" && (
                        <NativeButton onClick={() => markNotificationAsRead(notification)}>
                            Mark as read
                        </NativeButton>
                    )}
                    <DeleteIconButton onClick={() => deleteNotificatioMutation.mutate(notification.id)} />
                </NativeButtonGroup>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />

                <NativeButton
                    disabled={!notifications || notifications.filter(isUnread).length == 0}
                    className="is-info button"
                    onClick={markAllNotificationsAsRead}
                >
                    Mark all notifications as read
                </NativeButton>
            </div>
            <Title title="Notifications" />

            <NativeTable
                columns={columns}
                rows={notifications}
                rowId={(notification) => notification.id}
                emptyRowsMessage="No notifications available."
            ></NativeTable>
        </>
    );
};

export default NotificationsList;
