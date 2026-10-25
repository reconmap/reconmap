import { useAuditLogQuery } from "api/auditlog";
import PaginationV2 from "components/layout/PaginationV2";
import { useNavigate, useSearchParams } from "react-router";
import { downloadFromApi } from "services/api";
import Breadcrumb from "components/ui/Breadcrumb";
import SecondaryExportButton from "components/ui/buttons/SecondaryExportButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import AuditLogsTable from "components/auditlog/AuditLogsTable";
import { useTranslation } from "react-i18next";

const AuditLogListPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [query] = useSearchParams();
    let pageNumber: any = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const { data: auditLog, isLoading } = useAuditLogQuery({ page: pageNumber });

    const onPageChange = (pageNumber) => {
        navigate(`/auditlog?page=${pageNumber + 1}`);
    };

    const onExportClick = () => {
        downloadFromApi("/system/data?entities=audit_log");
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
                <PaginationV2 page={apiPageNumber} total={auditLog?.pageCount ?? 0} onPageChange={onPageChange} />
                <SecondaryExportButton onClick={onExportClick} />
            </div>
            <PageTitleHeader title={t("Audit log")} header={isLoading ? t("Audit log") : `${t("Audit log")} (${auditLog.totalCount})`} subHeader={t("System")} />
            <AuditLogsTable auditLog={isLoading ? null : auditLog.data} />
        </>
    );
};

export default AuditLogListPage;
