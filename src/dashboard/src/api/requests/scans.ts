import secureApiFetch from "services/api";
import { requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/scans";

export interface ScanRunTask {
    id: number;
    position: number;
    commandId: string;
    commandName: string;
    commandUsageId: string;
    executablePath?: string;
    arguments?: string;
    rationale?: string;
    status: "queued" | "running" | "succeeded" | "failed";
    error?: string;
    startedAt?: string;
    finishedAt?: string;
}

export interface ScanRun {
    id: number;
    projectId: string;
    target: string;
    targetType: string;
    objective: string;
    strategy?: string;
    status: "queued" | "running" | "succeeded" | "failed" | "partial";
    createdAt?: string;
    tasks: ScanRunTask[];
}

export const isScanRunActive = (run?: Pick<ScanRun, "status">) => run?.status === "queued" || run?.status === "running";

export const requestScanRuns = (params: { projectId?: string; limit?: number } = {}): Promise<ScanRun[]> => {
    const query = new URLSearchParams();
    if (params.projectId) query.set("projectId", String(params.projectId));
    if (params.limit) query.set("limit", String(params.limit));
    return secureApiFetch(`${API_BASE_URL}?${query}`, { method: "GET" }).then((res) => res.json());
};

export const requestScanRun = (id: number | string): Promise<ScanRun> =>
    secureApiFetch(`${API_BASE_URL}/${id}`, { method: "GET" }).then((res) => {
        if (!res.ok) throw new Error(`Scan ${id} could not be loaded`);
        return res.json();
    });

export const requestScanRunPost = (data: { projectId: string; target: string; targetType: string; objective: string }) =>
    requestEntityPost(API_BASE_URL, data);
