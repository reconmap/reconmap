import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestNotificationDelete, requestNotifications } from "./requests/notifications.js";

const useNotificationsQuery = (params: any) => {
    return useQuery({
        queryKey: ["system-notifications", params],
        queryFn: () => requestNotifications(params).then((resp) => resp.json()),
    });
};

const useDeleteNotificationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => requestNotificationDelete(notificationId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
        },
    });
};

export { useDeleteNotificationMutation, useNotificationsQuery };
