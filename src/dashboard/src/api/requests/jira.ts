import { requestEntities, requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests";


const requestJiraIntegrations = (init?: RequestInit) => {
    return requestEntities(`/integrations/jira`, undefined, init);
};

const requestJiraIntegration = (id: number, init?: RequestInit) => {
    return requestEntity(`/integrations/jira/${id}`, init);
};

const requestJiraIntegrationCreate = (data: any) => {
    return requestEntityPost(`/integrations/jira`, data);
};

const requestJiraIntegrationUpdate = (id: number, data: any) => {
    return requestEntityPut(`/integrations/jira/${id}`, data);
};

const requestJiraIntegrationDelete = (id: number) => {
    return requestEntityDelete(`/integrations/jira/${id}`);
};

export {
    requestJiraIntegration,
    requestJiraIntegrationCreate,
    requestJiraIntegrationDelete, requestJiraIntegrations, requestJiraIntegrationUpdate
};

