import { useState } from "react";
import { useDeleteNotificationMutation, useNotificationsQuery } from "api/notifications.js";
import { requestNotificationsPatch, requestPartialNotificationUpdate, requestNotificationsDelete } from "api/requests/notifications.js";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import Loading from "components/ui/Loading.jsx";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import Title from "components/ui/Title";
import Tag from "components/ui/Tag.jsx";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { actionCompletedToast } from "components/ui/toast.jsx";

const isUnread = (notification) => notification.status === "unread";

const NotificationsList = () => {
    const { data: notifications, refetch, isLoading } = useNotificationsQuery({});
    const deleteNotificatioMutation = useDeleteNotificationMutation();
    const [selectedIds, setSelectedIds] = useState([]);



    const markSelectedAsRead = () => {
        requestNotificationsPatch({
            ids: selectedIds,
            status: 'read'
        }).then(() => {
            refetch();
            setSelectedIds([]);
            actionCompletedToast("Selected notifications marked as read");
        });
    };

    const markSelectedAsUnread = () => {
        requestNotificationsPatch({
            ids: selectedIds,
            status: 'unread'
        }).then(() => {
            refetch();
            setSelectedIds([]);
            actionCompletedToast("Selected notifications marked as unread");
        });
    };

    const deleteSelected = () => {
        if (!confirm("Are you sure you want to delete the selected notifications?")) return;
        requestNotificationsDelete({
            ids: selectedIds
        }).then(() => {
            refetch();
            setSelectedIds([]);
            actionCompletedToast("Selected notifications deleted");
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
            header: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds(notifications.map(n => n.id));
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                    checked={notifications && notifications.length > 0 && selectedIds.length === notifications.length}
                />
            ),
            cell: (notification) => (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds([...selectedIds, notification.id]);
                        } else {
                            setSelectedIds(selectedIds.filter(id => id !== notification.id));
                        }
                    }}
                    checked={selectedIds.includes(notification.id)}
                />
            ),
        },
        {
            header: "Date/time",
            cell: (notification) => <RelativeDateFormatter date={notification.createdAt} />,
        },
        {
            header: "Content",
            cell: (notification) => (
                <>
                    <strong>
                        {notification.title}
                        {notification.status === "unread" && <span style={{ marginLeft: "0.5rem" }}><Tag>Unread</Tag></span>}
                    </strong>
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

                <NativeButtonGroup>
                    <NativeButton
                        disabled={selectedIds.length === 0}
                        onClick={markSelectedAsRead}
                    >
                        Mark selected as read
                    </NativeButton>
                    <NativeButton
                        disabled={selectedIds.length === 0}
                        onClick={markSelectedAsUnread}
                    >
                        Mark selected as unread
                    </NativeButton>
                    <NativeButton
                        disabled={selectedIds.length === 0}
                        className="is-danger button"
                        onClick={deleteSelected}
                    >
                        Delete selected
                    </NativeButton>
                </NativeButtonGroup>
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
