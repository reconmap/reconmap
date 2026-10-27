import { requestEntities } from "utilities/requests";

const API_BASE_URL = "/auditlog";

const requestAuditLog = async (params: any, init?: RequestInit) => {
    return (await requestEntities(`${API_BASE_URL}?` + new URLSearchParams(params).toString(), undefined, init)).json();
};

const requestAuditLogStats = (init?: RequestInit) => {
    return requestEntities(`${API_BASE_URL}/stats`, undefined, init);
};

export { requestAuditLog, requestAuditLogStats };
