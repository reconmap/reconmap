import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestAsset, requestAssetDelete, requestAssetEnsure, requestAssets } from "./requests/assets.js";

const useAssetQuery = (assetId: number) => {
    return useQuery({
        queryKey: ["assets", assetId],
        queryFn: () => requestAsset(assetId),
    });
};

const useAssetsQuery = (params: any) => {
    return useQuery({
        queryKey: ["assets", params],
        queryFn: () => requestAssets(params),
    });
};

const useDeleteAssetMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (assetId: number) => requestAssetDelete(assetId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
        },
    });
};

export { requestAssetEnsure, useAssetQuery, useAssetsQuery, useDeleteAssetMutation };
