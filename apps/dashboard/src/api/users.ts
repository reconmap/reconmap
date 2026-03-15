import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUser, getUsers, requestUserActivity } from "./requests/users.js";

const useUserQuery = (userId: number) => {
    return useQuery({
        queryKey: ["users", userId],
        queryFn: () => getUser(userId).then((res) => res.json()),
    });
};

const useUserActivity = (userId: number) => {
    return useQuery({
        queryKey: ["user", userId, "activity"],
        queryFn: () => requestUserActivity(userId).then((res) => res.json()),
    });
};

const useUsersQuery = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getUsers().then((res) => res.json()),
    });
};

const useUserDeleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => deleteUser(userId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export { deleteUser, getUser, getUsers, useUserActivity, useUserDeleteMutation, useUserQuery, useUsersQuery };
