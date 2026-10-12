import secureApiFetch from "services/api";
import { requestEntityDelete, requestEntityPost } from "utilities/requests";

const requestReports = (params: any) => {
    return secureApiFetch(
        "/reports?" + new URLSearchParams(params).toString(),
        { method: "GET" },
    );
};

const requestReportsTemplates = (params: any = {}) => {
    return secureApiFetch("/reports/templates?" + new URLSearchParams(params).toString(), { method: "GET" });
};

const requestReportPost = (params: any) => requestEntityPost('/reports', params);

const requestReportDelete = (reportId: number) => requestEntityDelete(`/reports/${reportId}`);

export { requestReportDelete, requestReportPost, requestReports, requestReportsTemplates };
