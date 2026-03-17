import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserApiTokenRequest } from "./user-api-tokens";
import {
    requestUserApiTokenDeletion,
    requestUserApiTokenPost,
    requestUserApiTokens,
} from "./requests/user-api-tokens";

export const useUserApiTokensQuery = () => {
    return useQuery({
        queryKey: ["user-api-tokens"],
        queryFn: () => requestUserApiTokens().then((res) => res.json()),
    });
};

export const useUserApiTokenCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateUserApiTokenRequest) => requestUserApiTokenPost(request).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["user-api-tokens"] });
        },
    });
};

export const useUserApiTokenDeleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => requestUserApiTokenDeletion(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["user-api-tokens"] });
        },
    });
};
