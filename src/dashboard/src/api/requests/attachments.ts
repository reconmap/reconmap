import secureApiFetch from "services/api.js";

const API_BASE_URL = "/attachments";

const requestAttachment = async (attachmentId: number) => {
    const resp = await secureApiFetch(`${API_BASE_URL}/${attachmentId}`, { method: "GET" });
    const contentDispositionHeader = resp.headers.get("Content-Disposition") || "";
    const contentType = resp.headers.get("Content-Type");
    const filenameRe = /filename="?([^";]+)"?/i;
    const filename = filenameRe.exec(contentDispositionHeader)?.[1] || null;

    return {
        contentType: contentType,
        filename: filename,
        blob: await resp.blob(),
    };
};

const requestAttachments = (params: any) => {
    return secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { method: "GET" });
};

const requestAttachmentPost = (attachment: FormData) => {
    return secureApiFetch(`${API_BASE_URL}`, { method: "POST", body: attachment });
};

const requestAttachmentDelete = (attachmentId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${attachmentId}`, { method: "DELETE" });
};

export { requestAttachment, requestAttachmentDelete, requestAttachmentPost, requestAttachments };
