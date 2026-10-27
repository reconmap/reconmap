import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestAsset, requestAssetDelete, requestAssetEnsure, requestAssets } from "./requests/assets";

const useAssetQuery = (assetId: number) => {
    return useQuery({
        queryKey: ["assets", assetId],
        queryFn: ({ signal }) => requestAsset(assetId, { signal }),
    });
};

const useAssetsQuery = (params: any) => {
    return useQuery({
        queryKey: ["assets", params],
        queryFn: ({ signal }) => requestAssets(params, { signal }),
        // The API rejects a request without a project id.
        enabled: Boolean(params?.projectId),
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
