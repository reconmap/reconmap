import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestCustomFieldDeletion,
    requestCustomFieldPost,
    requestCustomFields,
    requestExportables,
    requestRecentSearches,
    requestSystemMailSettings,
    requestSystemMailSettingsPut,
    requestSystemAiProviderModels,
    requestSystemAiSettings,
    requestSystemAiSettingsPut,
    requestSystemHealth,
    requestSystemIntegrations,
    requestSystemUsage,
} from "./requests/system";

interface ServiceStatus {
    reachable: boolean;
    latencyMs: number;
}

interface McpStatus {
    configured: boolean;
    reachable: boolean;
    latencyMs: number | null;
}

interface SystemHealth {
    attachmentsDirectory: boolean;
    databaseServer: ServiceStatus;
    keyValueServer: ServiceStatus;
    messageQueueServer: ServiceStatus;
    mcpServer: McpStatus;
}

interface AiUsageTotals {
    calls: number;
    failedCalls: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
}

interface AiUsageBreakdownRow {
    key: string;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
}

interface AiUsageProjectRow extends Omit<AiUsageBreakdownRow, "key"> {
    projectId: number | null;
    projectName: string | null;
}

interface AiUsageUserRow extends Omit<AiUsageBreakdownRow, "key"> {
    userId: number | null;
}

interface AiUsageDailyRow extends Omit<AiUsageBreakdownRow, "key"> {
    date: string;
}

interface AiUsageSummary {
    totals: AiUsageTotals;
    byFeature: AiUsageBreakdownRow[];
    byModel: AiUsageBreakdownRow[];
    byProject: AiUsageProjectRow[];
    byUser: AiUsageUserRow[];
    daily: AiUsageDailyRow[];
}

interface SystemUsage {
    from: string;
    to: string;
    attachments: { totalCount: number; totalFileSize: number };
    redis: { available: boolean; usedMemoryBytes: number; maxMemoryBytes: number; keyCount: number };
    queues: { name: string; messages: number; consumers: number }[];
    ai: AiUsageSummary;
}

const useExportablesQuery = () => {
    return useQuery({
        queryKey: ["system-exportables"],
        queryFn: () => requestExportables().then((res) => res.json()),
    });
};

const useSystemHealthQuery = () => {
    return useQuery({
        queryKey: ["system-health"],
        queryFn: (): Promise<SystemHealth> => requestSystemHealth().then((res) => res.json()),
    });
};

const useSystemUsageQuery = (rangeDays: number) => {
    return useQuery({
        queryKey: ["system-usage", rangeDays],
        queryFn: (): Promise<SystemUsage> => requestSystemUsage(rangeDays).then((res) => res.json()),
    });
};

const useSystemMailSettingsQuery = () => {
    return useQuery({
        queryKey: ["system-mail-settings"],
        queryFn: () => requestSystemMailSettings().then((res) => res.json()),
    });
};

const useSystemAiSettingsQuery = () => {
    return useQuery({
        queryKey: ["system-ai-settings"],
        queryFn: () => requestSystemAiSettings().then((res) => res.json()),
    });
};

interface AiModelDescriptor {
    id: string;
    name: string | null;
    contextWindow: number | null;
    inputModalities: string[];
    reasoningEfforts: string[];
}

interface AiModelCatalog {
    providerId: string;
    capability: string;
    source: "live" | "verified-fallback";
    degraded: boolean;
    message: string | null;
    models: AiModelDescriptor[];
}

const useSystemAiProviderModelsQuery = (providerId: string | undefined, capability?: string) => {
    return useQuery<AiModelCatalog>({
        queryKey: ["system-ai-provider-models", providerId, capability ?? "chat"],
        queryFn: async () => {
            const response = await requestSystemAiProviderModels(providerId!, capability);
            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.message ?? "Unable to load the model catalog.");
            }

            return payload;
        },
        enabled: Boolean(providerId),
        // Model catalogs change rarely; keep the server-side key boundary and cache the metadata.
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
};

const useSystemCustomFieldsQuery = () => {
    return useQuery({
        queryKey: ["system-custom-fields"],
        queryFn: () => requestCustomFields().then((res) => res.json()),
    });
};

const useSystemIntegrationsQuery = () => {
    return useQuery({
        queryKey: ["system-integrations"],
        queryFn: () => requestSystemIntegrations().then((res) => res.json()),
    });
};

const useRecentSearchesQuery = () => {
    return useQuery({
        queryKey: ["system-recent-searches"],
        queryFn: () => requestRecentSearches().then((res) => res.json()),
    });
};

const useSystemCustomFieldPostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (customFieldId: number) => requestCustomFieldPost(customFieldId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["system-custom-fields"] });
        },
    });
};

const useSystemCustomFieldDeletionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (customFieldId: number) => requestCustomFieldDeletion(customFieldId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["system-custom-fields"] });
        },
    });
};

const useSystemMailSettingsUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: any) =>
            requestSystemMailSettingsPut(settings).then(async (res) => {
                const payload = await res.json().catch(() => null);
                if (!res.ok) {
                    throw new Error(payload?.message ?? "Unable to save mail settings.");
                }

                return payload;
            }),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["system-mail-settings"] });
        },
    });
};

const useSystemAiSettingsUpdateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: any) =>
            requestSystemAiSettingsPut(settings).then(async (res) => {
                const payload = await res.json().catch(() => null);
                if (!res.ok) {
                    throw new Error(payload?.message ?? "Unable to save AI settings.");
                }

                return payload;
            }),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["system-ai-settings"] });
        },
    });
};

export type { AiModelCatalog, AiModelDescriptor, AiUsageBreakdownRow, AiUsageSummary, McpStatus, ServiceStatus, SystemHealth, SystemUsage };

export {
    useExportablesQuery,
    useRecentSearchesQuery,
    useSystemCustomFieldDeletionMutation,
    useSystemCustomFieldPostMutation,
    useSystemCustomFieldsQuery,
    useSystemHealthQuery,
    useSystemIntegrationsQuery,
    useSystemMailSettingsQuery,
    useSystemMailSettingsUpdateMutation,
    useSystemAiSettingsQuery,
    useSystemAiSettingsUpdateMutation,
    useSystemAiProviderModelsQuery,
    useSystemUsageQuery,
};
