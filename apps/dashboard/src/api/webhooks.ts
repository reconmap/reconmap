import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestWebhook,
    requestWebhookDelete,
    requestWebhooks,
} from "./requests/webhooks.js";

const useWebhookQuery = (webhookId: number) => {
    return useQuery({
        queryKey: ["webhooks", webhookId],
        queryFn: () => requestWebhook(webhookId).then((res) => res.json()),
    });
};

const useWebhooksQuery = () => {
    return useQuery({
        queryKey: ["webhooks"],
        queryFn: () => requestWebhooks(),
    });
};

const useDeleteWebhookMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (webhookId: number) => requestWebhookDelete(webhookId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
        },
    });
};

export {
    useDeleteWebhookMutation,
    useWebhookQuery,
    useWebhooksQuery,
};
