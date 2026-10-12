import {
    requestEntity,
    requestEntityDelete,
    requestEntityPut,
} from "utilities/requests";
import secureApiFetch from "services/api";

const API_BASE_URL = "/webhooks";

const requestWebhook = (webhookId: number) => requestEntity(`${API_BASE_URL}/${webhookId}`);

const requestWebhooks = async () => {
    return (await secureApiFetch(API_BASE_URL, { method: "GET" })).json();
};

const requestWebhookDelete = (webhookId: number) => requestEntityDelete(`${API_BASE_URL}/${webhookId}`);

const requestWebhookPost = (webhook: Record<string, any>) => {
    return secureApiFetch(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(webhook),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestWebhookPut = (webhookId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${webhookId}`, data);

export {
    requestWebhook,
    requestWebhooks,
    requestWebhookDelete,
    requestWebhookPost,
    requestWebhookPut,
};
