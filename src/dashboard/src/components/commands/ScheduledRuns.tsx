import { type MouseEvent } from "react";
import { useConfirm } from "components/ui/useConfirm";
import { useSchedulesQuery } from "api/commands";
import { requestCommandScheduleDelete } from "api/requests/commands";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import { toast } from "components/ui/toast";
import { toString as CronExpressionToString } from "cronstrue";

const ScheduledRuns = () => {
    const { confirm, confirmDialog } = useConfirm();
    const { data: scheduledCommands, refetch: fetchScheduledCommands } = useSchedulesQuery();

    const deleteScheduledCommand = async (event: MouseEvent<HTMLElement>, commandSchedule) => {
        if (!(await confirm("Are you sure you want to delete this scheduled command?"))) return;
        requestCommandScheduleDelete(commandSchedule.commandId, commandSchedule.id)
            .then(() => {
                fetchScheduledCommands();
                toast.success("The scheduled command has been deleted.");
            })
            .catch((err) => console.error(err));
    };

    const columns = [
        {
            header: "Command",
            cell: (scheduledCommand) => scheduledCommand.command?.name || scheduledCommand.commandId
        },
        {
            header: "Project",
            cell: (scheduledCommand) => scheduledCommand.project?.name || scheduledCommand.projectId || "None"
        },
        { header: "Cron Expression", property: "cronExpression" },
        {
            header: "Description",
            cell: (scheduledCommand) =>
                CronExpressionToString(scheduledCommand.cronExpression, {
                    throwExceptionOnParseError: false,
                }),
        },
        { header: "Argument values", property: "argumentValues" },
        { header: "", cell: (scheduledCommand) => <DeleteButton display="icon" onClick={(event) => deleteScheduledCommand(event, scheduledCommand)} /> },
    ]

    return (
        <>
            <NativeTable rows={scheduledCommands} rowId={(scheduledCommand) => scheduledCommand.id} columns={columns} emptyRowsMessage="No scheduled commands available.">
            </NativeTable>
            {confirmDialog}
        </>
    );
};

export default ScheduledRuns;
