import secureApiFetch from "services/api.js";

const requestEntity = (url: string) => {
    return secureApiFetch(url, { method: "GET" });
};

const requestEntities = (url: string, params?: Record<string, string>) => {
    const fullUrl = url + (params ? "?" + new URLSearchParams(params).toString() : "");
    return secureApiFetch(fullUrl, { method: "GET" });
};

const requestEntityPost = (url: string, data?: FormData | Record<string, string | number>) => {
    const params: Record<string, string | FormData | { "Content-Type": string }> = {
        method: "POST",
    };
    if (data) {
        const isFormData = data instanceof FormData;
        if (isFormData) {
            params.body = data;
        } else {
            params.body = JSON.stringify(data);
            params.headers = {
                "Content-Type": "application/json",
            };
        }
    }
    return secureApiFetch(url, params);
};

const requestEntityPut = (url: string, data: Record<string, string>) => {
    return secureApiFetch(url, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestEntityPatch = (url: string, data: Record<string, string>) => {
    return secureApiFetch(url, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

const requestEntityDelete = (url: string) => {
    return secureApiFetch(url, {
        method: "DELETE",
    });
};

export { requestEntities, requestEntity, requestEntityDelete, requestEntityPatch, requestEntityPost, requestEntityPut };
