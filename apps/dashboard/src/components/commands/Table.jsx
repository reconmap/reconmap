import { useQueryClient } from "@tanstack/react-query";
import { useCommandDeleteMutation } from "api/commands.js";
import Tags from "components/ui/Tags";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { useTranslation } from "react-i18next";
import CommandBadge from "./Badge";

const CommandsTable = ({ commands }) => {
    const [t] = useTranslation();
    const commandDeleteMutation = useCommandDeleteMutation();
    const queryClient = useQueryClient();

    const columns = [
        {
            header: t("Name"),
            cell: (command) => <CommandBadge command={command} />,
        },
        {
            header: t("Description"),
            className: "only-desktop",
            cell: (command) => (
                <>
                    {command.description}
                    <br />
                    <Tags values={command.tags} />
                </>
            ),
        },
        {
            header: "Output parser",
            cell: (command) => command.output_parser ?? "-",
        },
        {
            header: <>&nbsp;</>,
            cell: (command) => (
                <>
                    {" "}
                    <LinkButton href={`/commands/${command.id}/edit`}>Edit</LinkButton>
                    <DeleteIconButton
                        onClick={() => {
                            commandDeleteMutation.mutate(command.id);
                            queryClient.invalidateQueries({ queryKey: ["vault"] });
                        }}
                    />
                </>
            ),
        },
    ];

    return <NativeTable columns={columns} rows={commands} rowId={(command) => command.id}></NativeTable>;
};

export default CommandsTable;
