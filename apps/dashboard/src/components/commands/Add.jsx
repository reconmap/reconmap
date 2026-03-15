import { useQueryClient } from "@tanstack/react-query";
import { requestCommandPost } from "api/requests/commands.js";
import { actionCompletedToast } from "components/ui/toast";
import Command from "models/Command";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import CommandForm from "./Form";

const AddCommandPage = () => {
    const navigate = useNavigate();
    const [newCommand, setNewCommand] = useState(Command);
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        requestCommandPost(newCommand).then(() => {
            queryClient.invalidateQueries({ queryKey: ["commands"] });
            navigate(`/commands`);
            actionCompletedToast(`The command "${newCommand.name}" has been added.`);
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/commands">Commands</Link>
                </Breadcrumb>
            </div>

            <Title title="New command details" />

            <CommandForm onFormSubmit={onFormSubmit} command={newCommand} commandSetter={setNewCommand} />
        </div>
    );
};

export default AddCommandPage;
