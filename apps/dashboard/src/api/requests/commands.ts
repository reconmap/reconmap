import secureApiFetch from "services/api.js";
import { requestEntities, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/commands";

const requestCommand = (commandId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}`, { method: "GET" });
};

const requestCommands = async (params: any) => {
    return (await requestEntities(`${API_BASE_URL}?` + new URLSearchParams(params).toString())).json();
};

export const requestCommandUsagePost = (commandId: number, usage: Record<string, string>) =>
    requestEntityPost(`${API_BASE_URL}/${commandId}/usages`, usage);

const requestCommandUsages = (commandId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/usages`, { method: "GET" });
};

const requestCommandSchedules = (commandId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/schedules`, { method: "GET" });
};

const requestSchedules = () => {
    return secureApiFetch(`${API_BASE_URL}/schedules`, { method: "GET" });
};

export const requestCommandSchedulePost = (commandId: number, schedule: Record<string, string>) =>
    requestEntityPost(`${API_BASE_URL}/${commandId}/schedules`, schedule);

const requestCommandsOutputParsers = () => {
    return secureApiFetch(`${API_BASE_URL}/output-parsers`, { method: "GET" });
};

const requestCommandDelete = (commandId: number) => requestEntityDelete(`${API_BASE_URL}/${commandId}`);

export const requestCommandPut = (commandId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${commandId}`, data);

const requestCommandPost = (command: Record<string, string>) => requestEntityPost(API_BASE_URL, command);

const requestCommandScheduleDelete = (commandId: number, scheduleId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/schedules/${scheduleId}`, { method: "DELETE" });
};

const requestCommandUsageDelete = (commandId: number, usageId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/usages/${usageId}`, { method: "DELETE" });
};

const requestCommandOutputPost = (formData: FormData) => {
    return secureApiFetch(`${API_BASE_URL}/outputs`, { method: "POST", body: formData });
};

export {
    requestCommand,
    requestCommandDelete,
    requestCommandPost,
    requestCommands,
    requestCommandScheduleDelete,
    requestCommandSchedules,
    requestSchedules,
    requestCommandsOutputParsers,
    requestCommandUsageDelete,
    requestCommandUsages,
    requestCommandOutputPost
};

