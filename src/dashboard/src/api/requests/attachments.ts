import secureApiFetch from "services/api";

const API_BASE_URL = "/attachments";

const requestAttachment = async (attachmentId: number, init?: RequestInit) => {
    const resp = await secureApiFetch(`${API_BASE_URL}/${attachmentId}`, { ...init, method: "GET" });
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

const requestAttachments = (params: any, init?: RequestInit) => {
    return secureApiFetch(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), { ...init, method: "GET" });
};

const requestAttachmentPost = (attachment: FormData, init?: RequestInit) => {
    return secureApiFetch(`${API_BASE_URL}`, { ...init, method: "POST", body: attachment });
};

const requestAttachmentDelete = (attachmentId: number) => {
    return secureApiFetch(`${API_BASE_URL}/${attachmentId}`, { method: "DELETE" });
};

export { requestAttachment, requestAttachmentDelete, requestAttachmentPost, requestAttachments };
