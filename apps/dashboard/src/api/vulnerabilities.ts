import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestVulnerabilities,
    requestVulnerabilitiesStats,
    requestVulnerability,
    requestVulnerabilityCategories,
    requestVulnerabilityCategoryDelete,
    requestVulnerabilityDelete,
    requestVulnerabilityPost,
} from "./requests/vulnerabilities.js";

const useVulnerabilitiesQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", params],
        queryFn: () => requestVulnerabilities(params),
    });
};

const useVulnerabilityCategoriesQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", "categories", params],
        queryFn: () => requestVulnerabilityCategories(params).then((res) => res.json()),
    });
};

const useVulnerabilitiesStatsQuery = (params: any) => {
    return useQuery({
        queryKey: ["vulnerabilities", "stats", params],
        queryFn: () => requestVulnerabilitiesStats(params).then((res) => res.json()),
    });
};

const useVulnerabilityQuery = (vulnerabilityId: number) => {
    return useQuery({
        queryKey: ["vulnerabilities", vulnerabilityId],
        queryFn: () => requestVulnerability(vulnerabilityId).then((res) => res.json()),
    });
};

const useMutationPostDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (document: any) => requestVulnerabilityPost(document).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    });
};

const useDeleteVulnerabilityMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vulnerabilityId: number) => requestVulnerabilityDelete(vulnerabilityId),
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

export {
    useDeleteVulnerabilityCategoryMutation,
    useDeleteVulnerabilityMutation,
    useMutationPostDocument,
    useVulnerabilitiesQuery,
    useVulnerabilitiesStatsQuery,
    useVulnerabilityCategoriesQuery,
    useVulnerabilityQuery
};

