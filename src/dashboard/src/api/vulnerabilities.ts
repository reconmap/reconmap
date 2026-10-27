import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestVulnerabilities,
    requestVulnerabilitiesStats,
    requestVulnerability,
    requestVulnerabilityCategories,
    requestVulnerabilityCategoryDelete,
    requestVulnerabilityDelete,
    requestVulnerabilityTriage,
} from "./requests/vulnerabilities";

const useVulnerabilitiesQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", params],
        queryFn: ({ signal }) => requestVulnerabilities(params, { signal }),
    });
};

const useVulnerabilityCategoriesQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", "categories", params],
        queryFn: ({ signal }) => requestVulnerabilityCategories(params, { signal }).then((res) => res.json()),
    });
};

const useVulnerabilitiesStatsQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", "stats", params],
        queryFn: ({ signal }) => requestVulnerabilitiesStats(params, { signal }).then((res) => res.json()),
    });
};

const useVulnerabilityQuery = (vulnerabilityId: string) => {
    return useQuery({
        queryKey: ["vulnerabilities", vulnerabilityId],
        queryFn: ({ signal }) => requestVulnerability(vulnerabilityId, { signal }).then((res) => res.json()),
    });
};

const useDeleteVulnerabilityMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vulnerabilityId: string) => requestVulnerabilityDelete(vulnerabilityId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
        },
    });
};

const useDeleteVulnerabilityCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vulnerabilityCategoryId: number) =>
            requestVulnerabilityCategoryDelete(vulnerabilityCategoryId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
        },
    });
};

const useVulnerabilityTriageMutation = () => {
    return useMutation({
        mutationFn: (vulnerabilityId: string) =>
            requestVulnerabilityTriage(vulnerabilityId).then((res) => res.json()),
    });
};

export {
    useDeleteVulnerabilityCategoryMutation,
    useDeleteVulnerabilityMutation,
    useVulnerabilitiesQuery,
    useVulnerabilitiesStatsQuery,
    useVulnerabilityCategoriesQuery,
    useVulnerabilityQuery,
    useVulnerabilityTriageMutation,
};
