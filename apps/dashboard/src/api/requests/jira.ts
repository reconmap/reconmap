import Configuration from "Configuration";
import { fetchExtended } from "./system.js";

const requestJiraIntegrations = () => {
    return fetchExtended(`${Configuration.getDefaultApiUrl()}/api/integrations/jira`);
};

const requestJiraIntegration = (id: number) => {
    return fetchExtended(`${Configuration.getDefaultApiUrl()}/api/integrations/jira/${id}`);
};

const requestJiraIntegrationCreate = (data: any) => {
    return fetchExtended(`${Configuration.getDefaultApiUrl()}/api/integrations/jira`, {
        method: "POST",
        body: JSON.stringify(data),
    });
};

const requestJiraIntegrationUpdate = (id: number, data: any) => {
    return fetchExtended(`${Configuration.getDefaultApiUrl()}/api/integrations/jira/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

const requestJiraIntegrationDelete = (id: number) => {
    return fetchExtended(`${Configuration.getDefaultApiUrl()}/api/integrations/jira/${id}`, {
        method: "DELETE",
    });
};

export {
    requestJiraIntegration,
    requestJiraIntegrationCreate,
    requestJiraIntegrationDelete,
    requestJiraIntegrationUpdate,
    requestJiraIntegrations,
};
