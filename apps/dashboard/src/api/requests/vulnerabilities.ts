import secureApiFetch from "services/api.js";
import { requestEntities, requestEntityDelete, requestEntityPost, requestEntityPut } from "utilities/requests.js";

const API_BASE_URL = "/vulnerabilities";

const requestVulnerabilities = async (params: Record<string, any>) => {
    const queryParams = new URLSearchParams(params).toString();
    return (await requestEntities(`${API_BASE_URL}?` + queryParams)).json();
};

const requestVulnerabilityPatch = (vulnerabilityId: number, data: any): Promise<Response> => {
    return secureApiFetch(`${API_BASE_URL}/${vulnerabilityId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
};

const requestVulnerabilitiesStats = (params: any) => {
    const url = "/vulnerabilities/stats?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { method: "GET" });
};

const requestVulnerability = (vulnerabilityId: number) => {
    return secureApiFetch(`/vulnerabilities/${vulnerabilityId}`, { method: "GET" });
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

const requestVulnerabilityCategories = (params: any) => {
    const url = "/vulnerabilities/categories?" + new URLSearchParams(params).toString();
    return secureApiFetch(url, { method: "GET" });
};

export const requestVulnerabilityCategoryPut = (categoryId: number, data: any) =>
    requestEntityPut(`/vulnerabilities/categories/${categoryId}`, data);

const requestVulnerabilityCategoryDelete = (categoryId: number) =>
    requestEntityDelete(`/vulnerabilities/categories/${categoryId}`);

const requestVulnerabilityDelete = (vulnerabilityId: number) => requestEntityDelete(`/vulnerabilities/${vulnerabilityId}`);

export const requestVulnerabilityTriage = (vulnerabilityId: number): Promise<Response> =>
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
