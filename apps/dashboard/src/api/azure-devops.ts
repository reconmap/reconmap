import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestAzureDevopsIntegration,
    requestAzureDevopsIntegrationCreate,
    requestAzureDevopsIntegrationDelete,
    requestAzureDevopsIntegrationUpdate,
    requestAzureDevopsIntegrations,
} from "./requests/azure-devops.js";

const useAzureDevopsIntegrationQuery = (id: number) => {
    return useQuery({
        queryKey: ["azure-devops-integrations", id],
        queryFn: () => requestAzureDevopsIntegration(id).then((res: Response) => res.json()),
    });
};

const useAzureDevopsIntegrationsQuery = () => {
    return useQuery({
        queryKey: ["azure-devops-integrations"],
        queryFn: () => requestAzureDevopsIntegrations().then((res: Response) => res.json()),
    });
};

const useCreateAzureDevopsIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => requestAzureDevopsIntegrationCreate(data),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["azure-devops-integrations"] });
        },
    });
};

const useUpdateAzureDevopsIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            requestAzureDevopsIntegrationUpdate(id, data),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["azure-devops-integrations"] });
        },
    });
};

const useDeleteAzureDevopsIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => requestAzureDevopsIntegrationDelete(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["azure-devops-integrations"] });
        },
    });
};

export {
    useCreateAzureDevopsIntegrationMutation,
    useDeleteAzureDevopsIntegrationMutation,
    useAzureDevopsIntegrationQuery,
    useAzureDevopsIntegrationsQuery,
    useUpdateAzureDevopsIntegrationMutation,
};
