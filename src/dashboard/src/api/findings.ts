import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestFindings,
    requestFindingsStats,
    requestFinding,
    requestFindingCategories,
    requestFindingCategoryDelete,
    requestFindingDelete,
    requestFindingTriage,
} from "./requests/findings";

const useFindingsQuery = (params: any) => {
    return useQuery({
        queryKey: ["findings", params],
        queryFn: ({ signal }) => requestFindings(params, { signal }),
    });
};

const useFindingCategoriesQuery = (params: any) => {
    return useQuery({
        queryKey: ["findings", "categories", params],
        queryFn: ({ signal }) => requestFindingCategories(params, { signal }).then((res) => res.json()),
    });
};

const useFindingsStatsQuery = (params: any) => {
    return useQuery({
        queryKey: ["findings", "stats", params],
        queryFn: ({ signal }) => requestFindingsStats(params, { signal }).then((res) => res.json()),
    });
};

const useFindingQuery = (findingId: string) => {
    return useQuery({
        queryKey: ["findings", findingId],
        queryFn: ({ signal }) => requestFinding(findingId, { signal }).then((res) => res.json()),
    });
};

const useDeleteFindingMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (findingId: string) => requestFindingDelete(findingId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["findings"] });
        },
    });
};

const useDeleteFindingCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (findingCategoryId: number) =>
            requestFindingCategoryDelete(findingCategoryId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["findings"] });
        },
    });
};

const useFindingTriageMutation = () => {
    return useMutation({
        mutationFn: (findingId: string) =>
            requestFindingTriage(findingId).then((res) => res.json()),
    });
};

export {
    useDeleteFindingCategoryMutation,
    useDeleteFindingMutation,
    useFindingsQuery,
    useFindingsStatsQuery,
    useFindingCategoriesQuery,
    useFindingQuery,
    useFindingTriageMutation,
};
