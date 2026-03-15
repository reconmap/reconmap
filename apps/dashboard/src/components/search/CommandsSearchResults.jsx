import { requestCommands } from "api/requests/commands.js";
import CommandsTable from "components/commands/Table";
import { useEffect, useState } from "react";

const CommandsSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }) => {
    const [commands, setCommands] = useState([]);

    useEffect(() => {
        const reloadData = () => {
            requestCommands({ keywords }).then((commands) => {
                setCommands(commands.data);
                setEmptyResults((emptyResults) =>
                    0 === commands.data.length
                        ? emptyResults.concat("commands")
                        : emptyResults.filter((value) => value !== "commands"),
                );
            });
        };

        reloadData();
    }, [keywords, setEmptyResults]);

    if (commands.length === 0) return <></>;

    return (
        <>
            <h3>{commands.length} matching commands</h3>
            <CommandsTable commands={commands} />
        </>
    );
};

export default CommandsSearchResults;
