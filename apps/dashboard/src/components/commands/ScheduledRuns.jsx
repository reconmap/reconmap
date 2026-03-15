import { useCommandSchedulesQuery, useCommandUsagesQuery } from "api/commands.js";
import { requestCommandScheduleDelete } from "api/requests/commands.js";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { toString as CronExpressionToString } from "cronstrue";

const ScheduledRuns = ({ command, task = null }) => {
    const { data: commandUsages } = useCommandUsagesQuery(command?.id);
    const { data: scheduledCommands } = useCommandSchedulesQuery(command?.id);

    const deleteScheduledCommand = (ev, commandSchedule) => {
        requestCommandScheduleDelete(command?.id, commandSchedule.id)
            .then(() => {
                fetchScheduledCommands();
                actionCompletedToast("The scheduled command has been deleted.");
            })
            .catch((err) => console.error(err));
    };

    const columns = [
        { header: "Cron Expression", property: "cronExpression" },
        {
            header: "Description",
            cell: (scheduledCommand) =>
                CronExpressionToString(scheduledCommand.cronExpression, {
                    throwExceptionOnParseError: false,
                }),
        },
        { header: "Argument values", property: "argument_values" },
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
