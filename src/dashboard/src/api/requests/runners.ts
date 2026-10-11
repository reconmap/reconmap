import secureApiFetch from "services/api.js";
import { requestEntity, requestEntityDelete, requestEntityPost } from "utilities/requests.js";

const API_BASE_URL = "/runners";

const requestRunners = async () => {
    return (await secureApiFetch(API_BASE_URL, { method: "GET" })).json();
};

export const requestRunnerPost = (data: any) => requestEntityPost(`${API_BASE_URL}`, data);

const requestRunner = (runnerId: number) => requestEntity(`${API_BASE_URL}/${runnerId}`).then((resp) => resp.json());

const requestRunnerDelete = (runnerId: number) => {
    return requestEntityDelete(`${API_BASE_URL}/${runnerId}`);
};

export { requestRunner, requestRunnerDelete, requestRunners };

