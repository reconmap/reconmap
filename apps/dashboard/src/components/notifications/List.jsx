import { useDeleteNotificationMutation, useNotificationsQuery } from "api/notifications.js";
import { requestNotificationPut, requestNotificationsPatch, requestPartialNotificationUpdate } from "api/requests/notifications.js";
import NativeButton from "components/form/NativeButton";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import Loading from "components/ui/Loading.jsx";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import Title from "components/ui/Title";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
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

            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th w={50}>&nbsp;</th>
                        <th w={200}>Date/time</th>
                        <th>Content</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {null === notifications && <LoadingTableRow numColumns={3} />}
                    {null !== notifications && notifications.length === 0 && <NoResultsTableRow numColumns={3} />}
                    {null !== notifications &&
                        notifications.length > 0 &&
                        notifications.map((notification) => (
                            <tr key={notification.id}>
                                <th>{notification.status === "read" ? <>(read)</> : <>&nbsp;</>}</th>
                                <td>
                                    <RelativeDateFormatter date={notification.createdAt} />
                                </td>
                                <td>
                                    <strong>{notification.title}</strong>
                                    <div>{notification.content}</div>
                                </td>
                                <td>
                                    <NativeButtonGroup>
                                        {notification.status === "unread" && (
                                            <NativeButton onClick={() => markNotificationAsRead(notification)}>
                                                Mark as read
                                            </NativeButton>
                                        )}
                                        <DeleteIconButton
                                            onClick={() => deleteNotificatioMutation.mutate(notification.id)}
                                        />
                                    </NativeButtonGroup>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </>
    );
};

export default NotificationsList;
