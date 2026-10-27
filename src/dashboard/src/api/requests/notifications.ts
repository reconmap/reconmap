import { requestEntities, requestEntityDelete, requestEntitiesDelete, requestEntityPatch } from "utilities/requests";

const API_BASE_URL = "/notifications";

const requestNotifications = async (params: any, init?: RequestInit) => requestEntities(API_BASE_URL, params, init);

export const requestPartialNotificationUpdate = (notificationId: number, data: any) =>
    requestEntityPatch(`${API_BASE_URL}/${notificationId}`, data);

const requestNotificationDelete = (notificationId: number) => requestEntityDelete(`${API_BASE_URL}/${notificationId}`);

const requestNotificationsDelete = (data: any): Promise<Response> => requestEntitiesDelete(`${API_BASE_URL}`, data);

const requestNotificationsPatch = (data: any): Promise<Response> => requestEntityPatch(`${API_BASE_URL}`, data);

export { requestNotificationDelete, requestNotificationsDelete, requestNotifications, requestNotificationsPatch };
