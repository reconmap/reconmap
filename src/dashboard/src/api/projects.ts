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
        queryFn: ({ signal }) => requestProject(projectId, { signal }).then((res) => res.json()),
    });
};

const useProjectsQuery = (params: Record<string, any>) => {
    return useQuery({
        queryKey: ["projects", params],
        queryFn: ({ signal }) => requestProjects(params, { signal }),
    });
};

const useProjectUsersQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId, "users"],
        queryFn: ({ signal }) => requestProjectUsers(projectId, { signal }).then((res) => res.json()),
    });
};
const useProjectVaultQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId, "vault"],
        queryFn: ({ signal }) => requestProjectVault(projectId, { signal }).then((res) => res.json()),
    });
};

const useProjectCategoriesQuery = () => {
    return useQuery({
        queryKey: ["projects", "categories"],
        queryFn: ({ signal }) => requestProjectCategories({ signal }).then((res) => res.json()),
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

