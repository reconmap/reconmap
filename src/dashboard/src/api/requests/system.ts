import secureApiFetch from "services/api";

const requestExportables = (init?: RequestInit) => {
    return secureApiFetch("/system/exportables", { ...init, method: "GET" });
};

const requestUploadLimits = (init?: RequestInit) => {
    return secureApiFetch("/system/upload-limits", { ...init, method: "GET" });
};

const requestSystemHealth = (init?: RequestInit) => {
    return secureApiFetch("/system/health", { ...init, method: "GET" });
};

const requestSystemUsage = (rangeDays: number, init?: RequestInit) => {
    const from = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000).toISOString();
    return secureApiFetch(`/system/usage?from=${encodeURIComponent(from)}`, { ...init, method: "GET" });
};

const requestSystemMailSettings = (init?: RequestInit) => {
    return secureApiFetch("/system/mail-settings", { ...init, method: "GET" });
};

const requestSystemMailSettingsPut = (data: any) => {
    return secureApiFetch("/system/mail-settings", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestSystemAiSettings = (init?: RequestInit) => {
    return secureApiFetch("/system/ai-settings", { ...init, method: "GET" });
};

const requestSystemAiSettingsPut = (data: any) => {
    return secureApiFetch("/system/ai-settings", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestCustomFields = (init?: RequestInit) => {
    return secureApiFetch("/system/custom-fields", { ...init, method: "GET" });
};

const requestCustomFieldPost = (data: any) => {
    return secureApiFetch(`/system/custom-fields`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestCustomFieldDeletion = (customFieldId: number) => {
    return secureApiFetch(`/system/custom-fields/${customFieldId}`, { method: "DELETE" });
};

const requestSystemIntegrations = (init?: RequestInit) => {
    return secureApiFetch(`/system/integrations`, { ...init, method: "GET" });
};

const requestRecentSearches = (init?: RequestInit) => {
    return secureApiFetch(`/searches/recent`, { ...init, method: "GET" });
};

export {
    requestCustomFieldDeletion,
    requestCustomFieldPost,
    requestCustomFields,
    requestExportables,
    requestRecentSearches,
    requestSystemMailSettings,
    requestSystemMailSettingsPut,
    requestSystemAiSettings,
    requestSystemAiSettingsPut,
    requestSystemHealth,
    requestSystemIntegrations,
    requestSystemUsage,
    requestUploadLimits
};
