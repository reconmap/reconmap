import { requestEntities } from "utilities/requests.js";

const API_BASE_URL = "/auditlog";

const requestAuditLog = async (params: any) => {
    return (await requestEntities(`${API_BASE_URL}?` + new URLSearchParams(params).toString())).json();
};

const requestAuditLogStats = () => {
    return requestEntities(`${API_BASE_URL}/stats`);
};

export { requestAuditLog, requestAuditLogStats };
