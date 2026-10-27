import { useQuery } from "@tanstack/react-query";
import { requestAuditLog, requestAuditLogStats } from "./requests/auditlog";

const useAuditLogQuery = (params: any) => {
    return useQuery({
        queryKey: ["audit-log", params],
        queryFn: ({ signal }) => requestAuditLog(params, { signal }),
    });
};

const useAuditLogStatsQuery = () => {
    return useQuery({
        queryKey: ["audit-log", "stats"],
        queryFn: ({ signal }) => requestAuditLogStats({ signal }).then((res) => res.json()),
    });
};

export { useAuditLogQuery, useAuditLogStatsQuery };
