import { useAuditLogQuery } from "api/auditlog.js";
import PaginationV2 from "components/layout/PaginationV2";
import Loading from "components/ui/Loading.jsx";
import useQuery from "hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { downloadFromApi } from "../../services/api";
import Breadcrumb from "../ui/Breadcrumb";
import ExportButton from "../ui/buttons/Export";
import Title from "../ui/Title";
import AuditLogsTable from "./AuditLogsTable";

const AuditLogList = () => {
    const navigate = useNavigate();
    const query = useQuery();
    let pageNumber = query.get("page");
    pageNumber = pageNumber !== null ? parseInt(pageNumber) : 1;
    const apiPageNumber = pageNumber - 1;

    const { data: auditLog, isLoading } = useAuditLogQuery({ page: apiPageNumber });

    const onPageChange = (pageNumber) => {
        navigate(`/auditlog?page=${pageNumber + 1}`);
    };

    const onExportClick = () => {
        downloadFromApi("/system/data?entities=audit_log");
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
                <PaginationV2 page={apiPageNumber} total={auditLog.pageCount} onPageChange={onPageChange} />
                <ExportButton onClick={onExportClick} />
            </div>
            <Title type="System" title={`Audit log (${auditLog.totalCount})`} />
            <AuditLogsTable auditLog={auditLog.data} />
        </>
    );
};

export default AuditLogList;
