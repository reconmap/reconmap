import { useQuery, useQueryClient } from "@tanstack/react-query";
import secureApiFetch from "services/api.js";

const requestVault = () => {
    return secureApiFetch(`/secrets`, { method: "GET" }).then((res) => res.json());
};

const useVaultQuery = () => {
    return useQuery({
        queryKey: ["vault"],
        queryFn: requestVault,
    });
};

export const invalidateVaultQueries = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["vault"] });
    };
};

export { useVaultQuery };
