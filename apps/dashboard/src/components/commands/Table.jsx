import Tags from "components/ui/Tags";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { useTranslation } from "react-i18next";
import CommandBadge from "./Badge";

const CommandsTable = ({ commands }) => {
    const [t] = useTranslation();

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
    ];

    return <NativeTable columns={columns} rows={commands} rowId={(command) => command.id}></NativeTable>;
};

export default CommandsTable;
