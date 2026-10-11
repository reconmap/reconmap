import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserApiTokenRequest } from "./user-api-tokens.js";
import {
    requestUserApiTokenDeletion,
    requestUserApiTokenPost,
    requestUserApiTokens,
} from "./requests/user-api-tokens.js";

export const useUserApiTokensQuery = () => {
    return useQuery({
        queryKey: ["user-api-tokens"],
        queryFn: () => requestUserApiTokens().then((res: Response) => res.json()),
    });
};

export const useUserApiTokenCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateUserApiTokenRequest) => requestUserApiTokenPost(request).then((res: Response) => res.json()),
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
