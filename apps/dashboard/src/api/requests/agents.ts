import secureApiFetch from "services/api.js";
import { requestEntity, requestEntityDelete, requestEntityPost } from "utilities/requests.js";

const API_BASE_URL = "/agents";

const requestAgents = async () => {
    return (await secureApiFetch(API_BASE_URL, { method: "GET" })).json();
};

export const requestAgentPost = (data: any) => requestEntityPost(`${API_BASE_URL}`, data);

const requestAgent = (agentId: number) => requestEntity(`${API_BASE_URL}/${agentId}`).then((resp) => resp.json());

const requestAgentDelete = (agentId: number) => {
    return requestEntityDelete(`${API_BASE_URL}/${agentId}`);
};

export { requestAgent, requestAgentDelete, requestAgents };

