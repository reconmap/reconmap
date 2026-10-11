import secureApiFetch from "services/api.js";
import { requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/tasks";

const requestTasks = (params: any) => {
    return secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { method: "GET" });
};

const requestTask = (taskId: number) => requestEntity(`${API_BASE_URL}/${taskId}`);

const requestTaskDelete = (taskId: number) => requestEntityDelete(`${API_BASE_URL}/${taskId}`);

const requestTasksDelete = (data: object) => {
    return secureApiFetch(`${API_BASE_URL}`, {
        method: "PATCH",
        headers: {
            "Bulk-Operation": "DELETE",
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
    });
};

const requestTaskPatch = (taskId: number, data: any) => requestEntityPut(`${API_BASE_URL}/${taskId}`, data);

const requestTasksPatch = (data: any) => {
    return secureApiFetch("/tasks", {
        method: "PATCH",
        headers: {
            "Bulk-Operation": "UPDATE",
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
    });
};

const requestTaskPost = (task: any) => requestEntityPost(API_BASE_URL, task);

export {
    requestTask,
    requestTaskDelete,
    requestTaskPatch,
    requestTaskPost,
    requestTasks,
    requestTasksDelete,
    requestTasksPatch
};

