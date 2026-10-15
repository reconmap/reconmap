import secureApiFetch from "services/api";
import { requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/commands";

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
    requestSchedules,
    requestCommandOutputPost,
    requestCommandScheduleDelete
};


