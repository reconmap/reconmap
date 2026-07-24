import secureApiFetch from "services/api.js";
import { requestEntities, requestEntityPost } from "utilities/requests.js";

const API_BASE_URL = "/commands";

const requestCommands = async (params: any) => {
    return (await requestEntities(`${API_BASE_URL}?` + new URLSearchParams(params).toString())).json();
};

const requestCommandUsages = (commandId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/usages`, { method: "GET" });
};

const requestSchedules = () => {
    return secureApiFetch(`${API_BASE_URL}/schedules`, { method: "GET" });
};

export const requestCommandSchedulePost = (commandId: number, schedule: Record<string, string>) =>
    requestEntityPost(`${API_BASE_URL}/${commandId}/schedules`, schedule);

const requestCommandOutputPost = (formData: FormData) => {
    return secureApiFetch(`${API_BASE_URL}/outputs`, { method: "POST", body: formData });
};

const requestCommandScheduleDelete = (commandId: number | string, scheduleId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commandId}/schedules/${scheduleId}`, { method: "DELETE" });
};

export {
    requestCommands,
    requestSchedules,
    requestCommandUsages,
    requestCommandOutputPost,
    requestCommandScheduleDelete
};


