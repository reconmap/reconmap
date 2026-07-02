import { requestAssetEnsure } from "api/assets.js";

export const URL_ASSET_TYPE = "url";

export const isUrlCapableUsage = (usage: { arguments?: string | null } | null | undefined) => {
    return Boolean(usage?.arguments?.includes("{{{URL"));
};

export const getUrlCapableUsages = (usages: Array<{ arguments?: string | null }> = []) => {
    return usages.filter((usage) => isUrlCapableUsage(usage));
};

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
