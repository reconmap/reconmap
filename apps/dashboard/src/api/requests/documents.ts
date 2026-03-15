import secureApiFetch from "services/api.js";
import { requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/documents";

const requestDocuments = (limit: number = -1) => {
    return secureApiFetch(`/documents?limit=${limit}`, { method: "GET" });
};

const requestDocument = (documentId: number) => requestEntity(`${API_BASE_URL}/${documentId}`);

const requestPostDocument = (document: any) => requestEntityPost(API_BASE_URL, document);

export const requestDocumentPut = (documentId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${documentId}`, data);

const requestDeleteDocument = (documentId: number) => requestEntityDelete(`${API_BASE_URL}/${documentId}`);

export { requestDeleteDocument, requestDocument, requestDocuments, requestPostDocument };
