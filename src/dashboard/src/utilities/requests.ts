import secureApiFetch from "services/api";

const requestEntity = (url: string, init?: RequestInit) => {
    return secureApiFetch(url, { ...init, method: "GET" });
};

const requestEntities = (url: string, params?: Record<string, string>, init?: RequestInit) => {
    const fullUrl = url + (params ? "?" + new URLSearchParams(params).toString() : "");
    return secureApiFetch(fullUrl, { ...init, method: "GET" });
};

const requestEntityPost = (url: string, data?: FormData | Record<string, string | number>, init?: RequestInit) => {
    const params: RequestInit = {
        ...init,
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

const requestEntitiesDelete = (url: string, data: any) => {
    return secureApiFetch(url, {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export { requestEntities, requestEntity, requestEntityDelete, requestEntitiesDelete, requestEntityPatch, requestEntityPost, requestEntityPut };
