import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestCommentDelete, requestCommentPost, requestComments } from "./requests/comments";

export interface NewComment {
    parentType: string;
    parentId: string;
    content: string;
}

const useCommentsQuery = (params: { parentType: string; parentId: string }) => {
    return useQuery({
        queryKey: ["comments", params],
        queryFn: () => requestComments(params),
    });
};

const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (comment: NewComment) => {
            const resp = await requestCommentPost(comment);
            if (!resp.ok) {
                throw new Error(`Failed to create comment. Status code: ${resp.status}`);
            }
            return resp.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
};

const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (commentId: number) => {
            const resp = await requestCommentDelete(commentId);
            if (!resp.ok) {
                throw new Error(`Failed to delete comment. Status code: ${resp.status}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });
};

export { useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation };
