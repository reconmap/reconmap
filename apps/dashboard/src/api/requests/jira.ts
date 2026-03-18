import { requestEntities, requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";


const requestJiraIntegrations = () => {
    return requestEntities(`/integrations/jira`);
};

const requestJiraIntegration = (id: number) => {
    return requestEntity(`/integrations/jira/${id}`);
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

