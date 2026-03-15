import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestCommentDelete, requestCommentPost, requestComments } from "./requests/comments.js";

const useNotesQuery = (params: any) => {
    return useQuery({
        queryKey: ["comments", params],
        queryFn: () => requestComments(params),
    });
};

const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId: number) => requestCommentDelete(commentId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
};

const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (comment: any) => requestCommentPost(comment).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
};

export { useCreateCommentMutation, useDeleteCommentMutation, useNotesQuery };
