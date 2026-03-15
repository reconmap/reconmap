import { useQueryClient } from "@tanstack/react-query";
import { requestCommandUsagePost } from "api/requests/commands.js";
import CommandUsage from "models/CommandUsage.js";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb.jsx";
import Title from "../ui/Title.jsx";
import CommandUsageForm from "./UsageForm.jsx";

const AddCommandUsagePage = () => {
    const navigate = useNavigate();
    const { commandId } = useParams();
    const defaultCommmandUsage = { commandId: commandId, ...CommandUsage };
    const queryClient = useQueryClient();

    const [commandUsage, setCommandUsage] = useState(defaultCommmandUsage);

    const onCommandUsageSubmit = (ev) => {
        ev.preventDefault();

        requestCommandUsagePost(commandId, commandUsage).then(() => {
            queryClient.invalidateQueries({ queryKey: ["commands", parseInt(commandId), "usages"] });
            setCommandUsage(defaultCommmandUsage);
            navigate(`/commands/${commandId}`);
        });
        return false;
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/commands">Commands</Link>
                </Breadcrumb>
            </div>
            <Title title="New command usage details" />
            <CommandUsageForm
                onFormSubmit={onCommandUsageSubmit}
                commandUsage={commandUsage}
                isEditForm={false}
                commandSetter={setCommandUsage}
            />{" "}
        </div>
    );
};

export default AddCommandUsagePage;
