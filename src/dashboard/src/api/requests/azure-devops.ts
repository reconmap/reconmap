import { requestEntities, requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests";


const requestAzureDevopsIntegrations = (init?: RequestInit) => {
    return requestEntities(`/integrations/azure-devops`, undefined, init);
};

const requestAzureDevopsIntegration = (id: number, init?: RequestInit) => {
    return requestEntity(`/integrations/azure-devops/${id}`, init);
};

const requestAzureDevopsIntegrationCreate = (data: any) => {
    return requestEntityPost(`/integrations/azure-devops`, data);
};

const requestAzureDevopsIntegrationUpdate = (id: number, data: any) => {
    return requestEntityPut(`/integrations/azure-devops/${id}`, data);
};

const requestAzureDevopsIntegrationDelete = (id: number) => {
    return requestEntityDelete(`/integrations/azure-devops/${id}`);
};

export {
    requestAzureDevopsIntegration,
    requestAzureDevopsIntegrationCreate,
    requestAzureDevopsIntegrationDelete, requestAzureDevopsIntegrations, requestAzureDevopsIntegrationUpdate
};
