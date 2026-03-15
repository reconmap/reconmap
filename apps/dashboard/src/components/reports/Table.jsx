import { useQueryClient } from "@tanstack/react-query";
import { useDeleteReportMutation } from "api/reports.js";
import { requestAttachment } from "api/requests/attachments.js";
import ProjectBadge from "components/projects/ProjectBadge";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import SecondaryButton from "components/ui/buttons/Secondary";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { useNavigate } from "react-router-dom";

const ReportsTable = ({ reports, updateReports, includeProjectColumn = false }) => {
    const navigate = useNavigate();

    const deleteReportMutation = useDeleteReportMutation();
    const queryclient = useQueryClient();

    const onDeleteClick = (reportId) => {
        deleteReportMutation.mutate(
            reportId,
            {
                onSuccess: () => {
                    updateReports();
                    queryclient.invalidateQueries({ queryKey: ["reports"] });
                },
            }
        );
    }

    const handleDownload = (reportId) => {
        requestAttachment(reportId).then(({ blob, filename }) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    const handleSendByEmail = (projectId) => {
        navigate(`/projects/${projectId}/report/send`);
    };

    const columns = [
        {
            header: 'Name (Description)',
            cell: (report) => `${report.versionName} (${report.versionDescription})`,
        },
        ...(includeProjectColumn ? [{
            header: 'Project',
            cell: (report) => <ProjectBadge project={{ id: report.projectId, name: report.project?.name }} />,
        }] : []),
        {
            header: 'Datetime',
            cell: (report) => <RelativeDateFormatter date={report.createdAt} />,
        },
        {
            header: 'Downloads',
            cell: (report) => (
                <SecondaryButton onClick={() => handleDownload(report.attachmentId)}>
                    {report.clientFileName?.split(".").pop().toUpperCase()}
                </SecondaryButton>
            ),
        },
        {
            header: '',
            cell: (report) => (
                <>
                    <SecondaryButton onClick={() => handleSendByEmail(report.projectId)}>
                        Send by email
                    </SecondaryButton>

                    <DeleteIconButton onClick={() => onDeleteClick(report.id)} />
                </>
            ),
        }
    ];

    return (
        <NativeTable rows={reports} rowId={(report) => report.id} columns={columns}>
        </NativeTable>
    );
};

export default ReportsTable;
