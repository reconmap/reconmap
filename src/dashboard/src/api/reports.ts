import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestReportDelete, requestReports, requestReportsTemplates } from "./requests/reports";

const useReportsQuery = (params: any) => {
    return useQuery({
        queryKey: ["reports", params],
        queryFn: ({ signal }) => requestReports(params, { signal }).then((res) => res.json()),
    });
};

const useReportsTemplatesQuery = (params: any) => {
    return useQuery({
        queryKey: ["reports", "templates", params],
        queryFn: ({ signal }) => requestReportsTemplates(params, { signal }).then((res) => res.json()),
    });
};

const useDeleteReportMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reportId: string) => requestReportDelete(reportId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
};

export { useDeleteReportMutation, useReportsQuery, useReportsTemplatesQuery };
