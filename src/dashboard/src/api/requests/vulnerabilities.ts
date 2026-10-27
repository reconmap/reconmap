import secureApiFetch from "services/api";
import { requestEntities, requestEntityDelete, requestEntityPost } from "utilities/requests";

const API_BASE_URL = "/vulnerabilities";

const requestVulnerabilities = async (params: Record<string, any>, init?: RequestInit) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`${API_BASE_URL}?` + queryParams, undefined, init)).json();
};

const requestVulnerabilityPatch = (vulnerabilityId: string, data: any): Promise<Response> => {
    return secureApiFetch(`${API_BASE_URL}/${vulnerabilityId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

const requestVulnerabilitiesStats = (params: any, init?: RequestInit) => {
    const url = "/vulnerabilities/stats?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { ...init, method: "GET" });
};

const requestVulnerability = (vulnerabilityId: string, init?: RequestInit) => {
    return secureApiFetch(`/vulnerabilities/${vulnerabilityId}`, { ...init, method: "GET" });
};

/**
 * HTML number inputs are serialized as strings. Convert the optional CVSS
 * value before sending it so an empty input is represented as JSON null,
 * rather than an invalid empty decimal string.
 */
export const normalizeVulnerabilityForSave = (vulnerability: any) => {
    const cvssScore = vulnerability.cvssScore;

    return {
        ...vulnerability,
        cvssScore: cvssScore === "" || cvssScore == null ? null : Number(cvssScore),
    };
};

const requestVulnerabilityPost = (vulnerability: any) =>
    requestEntityPost(API_BASE_URL, normalizeVulnerabilityForSave(vulnerability));

const requestVulnerabilityCategories = (params: any, init?: RequestInit) => {
    const url = "/vulnerabilities/categories?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { ...init, method: "GET" });
};

const requestVulnerabilityCategoryDelete = (categoryId: number) =>
    requestEntityDelete(`/vulnerabilities/categories/${categoryId}`);

const requestVulnerabilityDelete = (vulnerabilityId: string) => requestEntityDelete(`/vulnerabilities/${vulnerabilityId}`);

export const requestVulnerabilityTriage = (vulnerabilityId: string): Promise<Response> =>
    secureApiFetch(`/vulnerabilities/${vulnerabilityId}/triage`, { method: 'POST' });

export {
    requestVulnerabilities,
    requestVulnerabilitiesStats,
    requestVulnerability,
    requestVulnerabilityCategories,
    requestVulnerabilityCategoryDelete,
    requestVulnerabilityDelete,
    requestVulnerabilityPatch,
    requestVulnerabilityPost
};
