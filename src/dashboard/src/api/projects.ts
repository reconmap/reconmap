import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestProject,
    requestProjectCategories,
    requestProjectDelete,
    requestProjects,
    requestProjectUsers,
    requestProjectVault,
} from "./requests/projects";

const useProjectQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId],
        queryFn: () => requestProject(projectId).then((res) => res.json()),
    });
};

const useProjectsQuery = (params: Record<string, any>) => {
    return useQuery({
        queryKey: ["projects", params],
        queryFn: () => requestProjects(params),
    });
};

const useProjectUsersQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId, "users"],
        queryFn: () => requestProjectUsers(projectId).then((res) => res.json()),
    });
};
const useProjectVaultQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId, "vault"],
        queryFn: () => requestProjectVault(projectId).then((res) => res.json()),
    });
};

const useProjectCategoriesQuery = () => {
    return useQuery({
        queryKey: ["projects", "categories"],
        queryFn: () => requestProjectCategories().then((res) => res.json()),
    });
};

const useDeleteProjectMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: string) => requestProjectDelete(projectId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
};

export const useProjectQueriesInvalidation = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
    };
};

export {
    useDeleteProjectMutation,
    useProjectCategoriesQuery,
    useProjectQuery,
    useProjectsQuery,
    useProjectUsersQuery,
    useProjectVaultQuery
};

