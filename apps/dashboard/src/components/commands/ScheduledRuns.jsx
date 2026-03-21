import { useSchedulesQuery } from "api/commands.js";
import { requestCommandScheduleDelete } from "api/requests/commands.js";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { actionCompletedToast } from "components/ui/toast";
import { toString as CronExpressionToString } from "cronstrue";

const ScheduledRuns = () => {
    const { data: scheduledCommands, refetch: fetchScheduledCommands } = useSchedulesQuery();

    const deleteScheduledCommand = (ev, commandSchedule) => {
        requestCommandScheduleDelete(commandSchedule.commandId, commandSchedule.id)
            .then(() => {
                fetchScheduledCommands();
                actionCompletedToast("The scheduled command has been deleted.");
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
        { header: "", cell: (scheduledCommand) => <DeleteIconButton onClick={(ev) => deleteScheduledCommand(ev, scheduledCommand)} /> },
    ]

    return (
        <>
            <NativeTable rows={scheduledCommands} rowId={(scheduledCommand) => scheduledCommand.id} columns={columns} emptyRowsMessage="No scheduled commands available.">
            </NativeTable>
        </>
    );
};

export default ScheduledRuns;
