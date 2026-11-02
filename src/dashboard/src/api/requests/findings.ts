import secureApiFetch from "services/api";
import { requestEntities, requestEntityDelete, requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/findings";

const requestFindings = async (params: Record<string, any>, init?: RequestInit) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`${API_BASE_URL}?` + queryParams, undefined, init)).json();
};

const requestFindingPatch = (findingId: string, data: any): Promise<Response> => {
    return secureApiFetch(`${API_BASE_URL}/${findingId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

const requestFindingsStats = (params: any, init?: RequestInit) => {
    const url = "/findings/stats?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { ...init, method: "GET" });
};

const requestFinding = (findingId: string, init?: RequestInit) => {
    return secureApiFetch(`/findings/${findingId}`, { ...init, method: "GET" });
};

/**
 * HTML number inputs are serialized as strings. Convert the optional CVSS
 * value before sending it so an empty input is represented as JSON null,
 * rather than an invalid empty decimal string.
 */
export const normalizeFindingForSave = (finding: any) => {
    const cvssScore = finding.cvssScore;

    return {
        ...finding,
        cvssScore: cvssScore === "" || cvssScore == null ? null : Number(cvssScore),
    };
};

const requestFindingPost = (finding: any) =>
    requestEntityPost(API_BASE_URL, normalizeFindingForSave(finding));

const requestFindingCategories = (params: any, init?: RequestInit) => {
    const url = "/findings/categories?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { ...init, method: "GET" });
};

const requestFindingCategoryDelete = (categoryId: number) =>
    requestEntityDelete(`/findings/categories/${categoryId}`);

const requestFindingDelete = (findingId: string) => requestEntityDelete(`/findings/${findingId}`);

export const requestFindingTriage = (findingId: string): Promise<Response> =>
    secureApiFetch(`/findings/${findingId}/triage`, { method: 'POST' });

export {
    requestFindings,
    requestFindingsStats,
    requestFinding,
    requestFindingCategories,
    requestFindingCategoryDelete,
    requestFindingDelete,
    requestFindingPatch,
    requestFindingPost
};
