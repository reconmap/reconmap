import { requestEntities, requestEntity, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/documents";

const requestDocuments = async (params: Record<string, any>) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`${API_BASE_URL}?` + queryParams));
};

const requestDocument = (documentId: number) => requestEntity(`${API_BASE_URL}/${documentId}`);

const requestPostDocument = (document: any) => requestEntityPost(API_BASE_URL, document);

export const requestDocumentPut = (documentId: number, data: any) =>
    requestEntityPut(`${API_BASE_URL}/${documentId}`, data);

const requestDeleteDocument = (documentId: number) => requestEntityDelete(`${API_BASE_URL}/${documentId}`);

export { requestDeleteDocument, requestDocument, requestDocuments, requestPostDocument };
