import { requestAssetEnsure } from "api/assets";

const URL_ASSET_TYPE = "url";

export const ensureUrlAsset = async (projectId: number, url: string) => {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
        throw new Error("URL is required");
    }

    return requestAssetEnsure({
        projectId,
        name: normalizedUrl,
        type: URL_ASSET_TYPE,
    });
};
