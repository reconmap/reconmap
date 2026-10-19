import { useQuery } from "@tanstack/react-query";
import { isScanRunActive, requestScanRun, requestScanRuns } from "./requests/scans";

const POLL_INTERVAL_MS = 3000;

const useScanRunsQuery = (params: { projectId?: number; limit?: number } = {}) => {
    return useQuery({
        queryKey: ["scans", params],
        queryFn: () => requestScanRuns(params),
        // Keep refreshing while anything is still in flight so progress shows without a reload.
        refetchInterval: (query) => (query.state.data?.some((run) => isScanRunActive(run)) ? POLL_INTERVAL_MS : false),
    });
};

const useScanRunQuery = (id: number | string) => {
    return useQuery({
        queryKey: ["scans", id],
        queryFn: () => requestScanRun(id),
        refetchInterval: (query) => (isScanRunActive(query.state.data) ? POLL_INTERVAL_MS : false),
    });
};

export { useScanRunQuery, useScanRunsQuery };
