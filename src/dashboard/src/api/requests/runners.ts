import secureApiFetch from "services/api";
import { requestEntity, requestEntityDelete, requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/runners";

const requestRunners = async (init?: RequestInit) => {
    return (await secureApiFetch(API_BASE_URL, { ...init, method: "GET" })).json();
};

export const requestRunnerPost = (data: any) => requestEntityPost(`${API_BASE_URL}`, data);

const requestRunner = (runnerId: number, init?: RequestInit) =>
    requestEntity(`${API_BASE_URL}/${runnerId}`, init).then((resp) => resp.json());

const requestRunnerDelete = (runnerId: number) => {
    return requestEntityDelete(`${API_BASE_URL}/${runnerId}`);
};

export { requestRunner, requestRunnerDelete, requestRunners };

