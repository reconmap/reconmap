import secureApiFetch from "services/api";
import { requestEntityDelete, requestEntityPost } from "utilities/requests";

const requestReports = (params: any, init?: RequestInit) => {
    return secureApiFetch(
        "/reports?" + new URLSearchParams(params).toString(),
        { ...init, method: "GET" },
    );
};

const requestReportsTemplates = (params: any = {}, init?: RequestInit) => {
    return secureApiFetch("/reports/templates?" + new URLSearchParams(params).toString(), { ...init, method: "GET" });
};

const requestReportPost = (params: any) => requestEntityPost('/reports', params);

const requestReportDelete = (reportId: string) => requestEntityDelete(`/reports/${reportId}`);

export { requestReportDelete, requestReportPost, requestReports, requestReportsTemplates };
