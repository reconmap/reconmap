import { useQueryClient } from "@tanstack/react-query";

export const invalidateVaultQueries = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ["vault"] });
    };
};
