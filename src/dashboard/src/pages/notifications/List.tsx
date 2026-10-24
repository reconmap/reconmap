import { useState } from "react";
import {
    useBulkDeleteNotificationsMutation,
    useBulkUpdateNotificationsMutation,
    useDeleteNotificationMutation,
    useMarkNotificationMutation,
    useNotificationsQuery,
} from "api/notifications";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import PageTitleHeader from "components/ui/PageTitleHeader";
import Tag from "components/ui/Tag";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable";
import { actionCompletedToast } from "components/ui/toast";

const NotificationsList = () => {
    const { data: notifications, isLoading } = useNotificationsQuery({});
    const deleteNotificatioMutation = useDeleteNotificationMutation();
    const markNotificationMutation = useMarkNotificationMutation();
    const bulkUpdateMutation = useBulkUpdateNotificationsMutation();
    const bulkDeleteMutation = useBulkDeleteNotificationsMutation();
    const [selectedIds, setSelectedIds] = useState<any[]>([]);

    const markSelectedAsRead = () => {
        bulkUpdateMutation.mutate({ ids: selectedIds, status: "read" }, {
            onSuccess: () => {
                setSelectedIds([]);
                actionCompletedToast("Selected notifications marked as read");
            },
        });
    };

    const markSelectedAsUnread = () => {
        bulkUpdateMutation.mutate({ ids: selectedIds, status: "unread" }, {
            onSuccess: () => {
                setSelectedIds([]);
                actionCompletedToast("Selected notifications marked as unread");
            },
        });
    };

    const deleteSelected = () => {
        if (!confirm("Are you sure you want to delete the selected notifications?")) return;
        bulkDeleteMutation.mutate({ ids: selectedIds }, {
            onSuccess: () => {
                setSelectedIds([]);
                actionCompletedToast("Selected notifications deleted");
            },
        });
    };

    const markNotificationAsRead = (notification) => {
        markNotificationMutation.mutate({ id: notification.id, status: "read" });
    };

    const columns = [
        {
            header: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedIds((notifications ?? []).map(n => n.id));
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
            <PageTitleHeader title="Notifications" />

            <NativeTable
                columns={columns}
                rows={isLoading ? null : notifications}
                rowId={(notification) => notification.id}
                emptyRowsMessage="No notifications available."
            ></NativeTable>
        </>
    );
};

export default NotificationsList;
