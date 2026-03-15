import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestReportDelete, requestReports, requestReportsTemplates } from "./requests/reports.js";

const useReportsQuery = (params: any) => {
    return useQuery({
        queryKey: ["reports", params],
        queryFn: () => requestReports(params).then((res) => res.json()),
    });
};

const useReportsTemplatesQuery = (params: any) => {
    return useQuery({
        queryKey: ["reports", "templates", params],
        queryFn: () => requestReportsTemplates(params).then((res) => res.json()),
    });
};

const useDeleteReportMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reportId: number) => requestReportDelete(reportId),
    });
};

export { useDeleteReportMutation, useReportsQuery, useReportsTemplatesQuery };
