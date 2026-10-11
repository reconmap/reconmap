import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestJiraIntegration,
    requestJiraIntegrationCreate,
    requestJiraIntegrationDelete,
    requestJiraIntegrationUpdate,
    requestJiraIntegrations,
} from "./requests/jira.js";

const useJiraIntegrationQuery = (id: number) => {
    return useQuery({
        queryKey: ["jira-integrations", id],
        queryFn: () => requestJiraIntegration(id).then((res: Response) => res.json()),
    });
};

const useJiraIntegrationsQuery = () => {
    return useQuery({
        queryKey: ["jira-integrations"],
        queryFn: () => requestJiraIntegrations().then((res: Response) => res.json()),
    });
};

const useCreateJiraIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => requestJiraIntegrationCreate(data),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["jira-integrations"] });
        },
    });
};

const useUpdateJiraIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            requestJiraIntegrationUpdate(id, data),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["jira-integrations"] });
        },
    });
};

const useDeleteJiraIntegrationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => requestJiraIntegrationDelete(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["jira-integrations"] });
        },
    });
};

export {
    useCreateJiraIntegrationMutation,
    useDeleteJiraIntegrationMutation,
    useJiraIntegrationQuery,
    useJiraIntegrationsQuery,
    useUpdateJiraIntegrationMutation,
};
