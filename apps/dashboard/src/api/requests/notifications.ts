import secureApiFetch from "services/api.js";
import { requestEntities, requestEntityDelete, requestEntityPatch, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/notifications";

const requestNotifications = async (params: any) => requestEntities(API_BASE_URL, params);

export const requestNotificationPut = (notificationId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${notificationId}`, data);

export const requestPartialNotificationUpdate = (notificationId: number, data: any) =>
    requestEntityPatch(`${API_BASE_URL}/${notificationId}`, data);

const requestNotificationDelete = (notificationId: number) => requestEntityDelete(`${API_BASE_URL}/${notificationId}`);

const requestNotificationsPatch = (data: any): Promise<Response> => requestEntityPatch(`${API_BASE_URL}`, data);

export { requestNotificationDelete, requestNotifications, requestNotificationsPatch };
