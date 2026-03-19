import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    requestCustomFieldDeletion,
    requestCustomFieldPost,
    requestCustomFields,
    requestExportables,
    requestRecentSearches,
    requestSystemMailSettings,
    requestSystemMailSettingsPut,
    requestSystemHealth,
    requestSystemIntegrations,
    requestSystemUsage,
} from "./requests/system.js";

const useExportablesQuery = () => {
    return useQuery({
        queryKey: ["system-exportables"],
        queryFn: () => requestExportables().then((res) => res.json()),
    });
};

const useSystemHealthQuery = () => {
    return useQuery({
        queryKey: ["system-health"],
        queryFn: () => requestSystemHealth().then((res) => res.json()),
    });
};

const useSystemUsageQuery = () => {
    return useQuery({
        queryKey: ["system-usage"],
        queryFn: () => requestSystemUsage().then((res) => res.json()),
    });
};

const useSystemMailSettingsQuery = () => {
    return useQuery({
        queryKey: ["system-mail-settings"],
        queryFn: () => requestSystemMailSettings().then((res) => res.json()),
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
    useSystemUsageQuery,
};
