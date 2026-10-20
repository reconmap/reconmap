import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateVaultQueries = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["vault"] });
    };
};
