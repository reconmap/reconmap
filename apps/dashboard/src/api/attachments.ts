import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestAttachmentDelete, requestAttachments } from "./requests/attachments.js";

const useAttachmentsQuery = (params: any) => {
    return useQuery({
        queryKey: ["attachments", params],
        queryFn: () => requestAttachments(params).then((res) => res.json()),
    });
};

const useAttachmentDeleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (attachmentId: number) => requestAttachmentDelete(attachmentId).then((res) => res.json()),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["attachments"] });
        },
    });
};

export { useAttachmentDeleteMutation, useAttachmentsQuery };
