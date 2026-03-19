import { requestEntities, requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";


const requestAzureDevopsIntegrations = () => {
    return requestEntities(`/integrations/azure-devops`);
};

const requestAzureDevopsIntegration = (id: number) => {
    return requestEntity(`/integrations/azure-devops/${id}`);
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
