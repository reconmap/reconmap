import secureApiFetch from "services/api.js";

const requestExportables = () => {
    return secureApiFetch("/system/exportables", { method: "GET" });
};

const requestSystemHealth = () => {
    return secureApiFetch("/system/health", { method: "GET" });
};

const requestSystemUsage = () => {
    return secureApiFetch("/system/usage", { method: "GET" });
};

const requestSystemMailSettings = () => {
    return secureApiFetch("/system/mail-settings", { method: "GET" });
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

const requestSystemAiSettings = () => {
    return secureApiFetch("/system/ai-settings", { method: "GET" });
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

const requestCustomFields = () => {
    return secureApiFetch("/system/custom-fields", { method: "GET" });
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

const requestSystemIntegrations = () => {
    return secureApiFetch(`/system/integrations`, { method: "GET" });
};

const requestRecentSearches = () => {
    return secureApiFetch(`/searches/recent`, { method: "GET" });
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
    requestSystemUsage
};
