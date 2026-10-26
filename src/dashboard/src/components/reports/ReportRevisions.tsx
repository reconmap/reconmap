import { useReportsQuery } from "api/reports";
import CreateButton from "components/ui/buttons/CreateButton";
import TabToolbar from "components/ui/TabToolbar";
import { useSseMessage } from "contexts/SseContext";
import useBoolean from "hooks/useBoolean";
import ReportVersionModalDialog from "./ReportVersionModalDialog";
import ReportsTable from "./ReportsTable";

const ReportRevisions = ({ projectId }: any) => {
    const { data: reports, refetch: refetchReports } = useReportsQuery({ projectId });

    const { value: isAddDialogOpen, setTrue: openAddDialog, setFalse: closeAddDialog } = useBoolean();

    useSseMessage(() => {
        refetchReports();
    });

    const onDialogOk = () => {
        refetchReports();
        closeAddDialog();
    };

    return (
        <>
            <TabToolbar
                end={
                    <>
                        <ReportVersionModalDialog
                            projectId={projectId}
                            isOpen={isAddDialogOpen}
                            onSubmit={onDialogOk}
                            onCancel={closeAddDialog}
                        />
                        <CreateButton onClick={openAddDialog}>New revision&hellip;</CreateButton>
                    </>
                }
            />

            <ReportsTable reports={reports} updateReports={refetchReports} />
        </>
    );
};

export default ReportRevisions;
