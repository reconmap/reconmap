import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserInterface } from "models/User.js";
import { deleteUser, getUser, getUsers, requestUserActivity, updateUser } from "./requests/users.js";

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

const useUserUpdateMutation = (userId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: UserInterface) => {
            const res = await updateUser(user);
            if (!res.ok) throw new Error(`Updating the user failed with status ${res.status}`);
            return res;
        },
        onSuccess: () => {
            // The API merges Keycloak data into responses, so refetch the user and any list showing it.
            queryClient.invalidateQueries({ queryKey: ["users", userId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
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

export {
    deleteUser,
    getUser,
    getUsers,
    useUserActivity,
    useUserDeleteMutation,
    useUserQuery,
    useUsersQuery,
    useUserUpdateMutation,
};
