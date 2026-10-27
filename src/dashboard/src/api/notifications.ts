import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestNotificationDelete,
    requestNotifications,
    requestNotificationsDelete,
    requestNotificationsPatch,
    requestPartialNotificationUpdate,
} from "./requests/notifications";

// Shared prefix for every notifications query, so invalidating it refreshes all of them (badge, list page, ...).
const notificationsKey = ["system-notifications"];

const useNotificationsQuery = (params: any) => {
    return useQuery({
        queryKey: [...notificationsKey, params],
        queryFn: ({ signal }) => requestNotifications(params, { signal }).then((resp) => resp.json()),
    });
};

const useNotificationsMutation = <TVariables>(mutationFn: (variables: TVariables) => Promise<Response>) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKey });
        },
    });
};

const useDeleteNotificationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => requestNotificationDelete(notificationId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationsKey });
        },
    });
};

const useMarkNotificationMutation = () =>
    useNotificationsMutation((variables: { id: number; status: "read" | "unread" }) =>
        requestPartialNotificationUpdate(variables.id, { status: variables.status }),
    );

const useBulkUpdateNotificationsMutation = () =>
    useNotificationsMutation((variables: { ids: number[]; status: "read" | "unread" }) =>
        requestNotificationsPatch({ ids: variables.ids, status: variables.status }),
    );

const useBulkDeleteNotificationsMutation = () =>
    useNotificationsMutation((variables: { ids: number[] }) => requestNotificationsDelete({ ids: variables.ids }));

export {
    notificationsKey,
    useBulkDeleteNotificationsMutation,
    useBulkUpdateNotificationsMutation,
    useDeleteNotificationMutation,
    useMarkNotificationMutation,
    useNotificationsQuery,
};
