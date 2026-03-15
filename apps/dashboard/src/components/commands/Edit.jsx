import { useQueryClient } from "@tanstack/react-query";
import { useCommandQuery } from "api/commands.js";
import { requestCommandPut } from "api/requests/commands.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import { actionCompletedToast } from "../ui/toast";
import CommandForm from "./Form";

const EditCommandPage = () => {
    const navigate = useNavigate();
    const { commandId } = useParams();

    const { data: serverCommand } = useCommandQuery(commandId);
    const [clientCommand, setClientCommand] = useState(null);
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestCommandPut(commandId, clientCommand);

        queryClient.invalidateQueries({ queryKey: ["commands"] });
        navigate(`/commands/${commandId}`);
        actionCompletedToast(`The command "${clientCommand.name}" has been updated.`);
    };

    useEffect(() => {
        if (serverCommand) setClientCommand(serverCommand);
    }, [serverCommand]);

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/commands">Commands</Link>
                </Breadcrumb>
            </div>

            <Title title="Command details" />

            {!clientCommand ? (
                <Loading />
            ) : (
                <CommandForm
                    isEditForm={true}
                    onFormSubmit={onFormSubmit}
                    command={clientCommand}
                    commandSetter={setClientCommand}
                />
            )}
        </div>
    );
};

export default EditCommandPage;
