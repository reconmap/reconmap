import { useAuditLogQuery } from "api/auditlog";
import PaginationV2 from "components/layout/PaginationV2";
import { useNavigate, useSearchParams } from "react-router";
import { downloadFromApi } from "services/api";
import Breadcrumb from "components/ui/Breadcrumb";
import ExportButton from "components/ui/buttons/Export";
import Title from "components/ui/Title";
import AuditLogsTable from "components/auditlog/AuditLogsTable";

const AuditLogList = () => {
    const navigate = useNavigate();
    const [query] = useSearchParams();
    let pageNumber: any = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const { data: auditLog, isLoading } = useAuditLogQuery({ page: apiPageNumber });

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
                <ExportButton onClick={onExportClick} />
            </div>
            <Title type="System" title={isLoading ? "Audit log" : `Audit log (${auditLog.totalCount})`} />
            <AuditLogsTable auditLog={isLoading ? null : auditLog.data} />
        </>
    );
};

export default AuditLogList;
