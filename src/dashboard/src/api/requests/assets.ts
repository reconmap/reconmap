import secureApiFetch from "services/api";
import { requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/assets";

const requestAsset = (assetId: string, init?: RequestInit) => {
    return secureApiFetch(`${API_BASE_URL}/${assetId}`, { ...init, method: "GET" }).then((res) => res.json());
};

export const requestAssetPost = (data: any) => requestEntityPost(API_BASE_URL, data);
export const requestAssetUpdate = (assetId: string, data: any) =>
    secureApiFetch(`${API_BASE_URL}/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
export const requestAssetEnsure = (data: any) => requestEntityPost(`${API_BASE_URL}/ensure`, data);

const requestAssets = async (params: any, init?: RequestInit) => {
    const resp = await secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { ...init, method: "GET" });
    const assets: { data: any; pageCount?: string | null; totalCount?: string | null } = {
        data: await resp.json(),
    };
    if (resp.headers.has("X-Page-Count")) {
        assets.pageCount = resp.headers.get("X-Page-Count");
    }
    if (resp.headers.has("X-Total-Count")) {
        assets.totalCount = resp.headers.get("X-Total-Count");
    }
    return assets;
};

const requestAssetDelete = (assetId: string) => {
    return secureApiFetch(`${API_BASE_URL}/${assetId}`, {
        method: "DELETE",
    });
};

export { requestAsset, requestAssetDelete, requestAssets };
