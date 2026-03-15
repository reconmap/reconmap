import secureApiFetch from "services/api.js";
import { requestEntityPost } from "utilities/requests.js";

const API_BASE_URL = "/assets";

const requestAsset = (assetId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${assetId}`, { method: "GET" }).then((res) => res.json());
};

export const requestAssetPost = (data: any) => requestEntityPost(API_BASE_URL, data);

const requestAssets = async (params: any) => {
    const resp = await secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { method: "GET" });
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

const requestAssetDelete = (assetId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${assetId}`, {
        method: "DELETE",
    });
};

export { requestAsset, requestAssetDelete, requestAssets };
