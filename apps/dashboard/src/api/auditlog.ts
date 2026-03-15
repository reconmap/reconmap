import { useQuery } from "@tanstack/react-query";
import { requestAuditLog, requestAuditLogStats } from "./requests/auditlog.js";

const useAuditLogQuery = (params: any) => {
    return useQuery({
        queryKey: ["audit-log", params],
        queryFn: () => requestAuditLog(params),
    });
};

const useAuditLogStatsQuery = () => {
    return useQuery({
        queryKey: ["audit-log", "stats"],
        queryFn: () => requestAuditLogStats().then((res) => res.json()),
    });
};

export { useAuditLogQuery, useAuditLogStatsQuery };
