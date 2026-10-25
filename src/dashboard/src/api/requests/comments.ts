import secureApiFetch from "services/api";
import { requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/comments";

const requestComments = async (params: any) => {
    return (
        await secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { method: "GET" })
    ).json();
};

const requestCommentDelete = (commentId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${commentId}`, {
        method: "DELETE",
    });
};

const requestCommentPost = async (comment: any) => requestEntityPost(API_BASE_URL, comment);

export { requestCommentDelete, requestCommentPost, requestComments };
