import { useAgentsQuery } from "api/agents.js";
import { useCommandUsagesQuery } from "api/commands.js";
import { useProjectsQuery } from "api/projects.js";
import { requestCommandSchedulePost } from "api/requests/commands.js";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField.jsx";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect.jsx";
import CommandTerminal from "components/ui/CommandTerminal";
import ExternalLink from "components/ui/ExternalLink";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import cronstrue from "cronstrue";
import { StatusCodes } from "http-status-codes";
import { useEffect, useState } from "react";
import CommandService from "services/command";
import parseArguments from "services/commands/arguments";

const Bullet = () => <span style={{ color: "var(--bulma-primary" }}>▸</span>;

const CommandInstructions = ({ command, projectId = null, forcedRunFrequency = null, defaultUsageId = null, defaultArgumentValues = null }) => {
    const { data: commandUsages } = useCommandUsagesQuery(command?.id);

    const [usage, setUsage] = useState(null);

    const onUsageChange = (ev) => {
        const usages = commandUsages ?? [];
        const usage = usages.find((usage) => usage.id === ev.target.value);
        setUsage(usage || null);
    };

    useEffect(() => {
        const usages = commandUsages ?? [];

        if (defaultUsageId) {
            const defaultUsage = usages.find((usage) => usage.id === defaultUsageId);
            if (defaultUsage) {
                setUsage(defaultUsage);
                return;
            }
        }

        if (usage === null && usages.length === 1) {
            setUsage(usages[0]);
        }
    }, [commandUsages, defaultUsageId, usage]);

    if (commandUsages == null) {
        return (
            <>
                <p>This command has no instructions defined.</p>
            </>
        );
    }

    return (
        <>
            <NativeSelect onChange={(ev) => onUsageChange(ev)} value={usage?.id || defaultUsageId || "0"}>
                <option value="0">(select)</option>
                {commandUsages.map((usage) => (
                    <option key={usage.id} value={usage.id}>
                        {usage.description}
                    </option>
                ))}
            </NativeSelect>

            {usage !== null && (
                <>
                    <h4 className="title is-4">Instructions for command "{command.name}"</h4>
                    <UsageDetail projectId={projectId} command={command} usage={usage} forcedRunFrequency={forcedRunFrequency} defaultArgumentValues={defaultArgumentValues} />
                </>
            )}
        </>
    );
};

const UsageDetail = ({ projectId: parentProjectId, command, usage, forcedRunFrequency = null, defaultArgumentValues = null }) => {
    const [commandArgsRendered, setCommandArgsRendered] = useState("");
    const [commandArgs, setCommandArgs] = useState(() => parseArguments(usage));
    const [showTerminal, setShowTerminal] = useState(false);
    const [runFrequency, setRunFrequency] = useState(forcedRunFrequency || "once");
    const [projectId, setProjectId] = useState(parentProjectId ?? null);
    const [agent, setAgent] = useState(null);
    const { data: projects } = useProjectsQuery({ isTemplate: false, status: "active" });
    const { data: agents, isLoading: isAgentsLoading } = useAgentsQuery();

    useEffect(() => {
        if (forcedRunFrequency) {
            setRunFrequency(forcedRunFrequency);
        }
    }, [forcedRunFrequency]);

    useEffect(() => {
        if (parentProjectId) {
            setProjectId(parentProjectId);
        } else if (projects?.data?.length > 0 && !projectId) {
            setProjectId(projects.data[0].id);
        }
    }, [parentProjectId, projects, projectId]);

    const [cronExpression, setCronExpression] = useState("");
    const [cronExpressionErrorMessage, setCronExpressionErrorMessage] = useState(null);

    const onArgUpdate = (ev, usage) => {
        setCommandArgs({
            ...commandArgs,
            [ev.target.name]: {
                name: ev.target.name,
                placeholder: ev.target.value,
            },
        });

    };

    useEffect(() => {
        const parsedArgs = parseArguments(usage);
        if (defaultArgumentValues) {
            Object.entries(defaultArgumentValues).forEach(([key, value]) => {
                if (parsedArgs[key]) {
                    parsedArgs[key] = {
                        ...parsedArgs[key],
                        placeholder: value,
                    };
                }
            });
        }
        setCommandArgs(parsedArgs);
    }, [usage, defaultArgumentValues]);

    const runOnTerminal = (ev) => {
        setShowTerminal(true);
    };

    const onCronExpressionChange = (ev) => {
        setCronExpression(ev.target.value);
        try {
            const message = cronstrue.toString(ev.target.value);
            setCronExpressionErrorMessage(message);
        } catch (err) {
            setCronExpressionErrorMessage(err.message);
        }
    };

    const saveScheduledCommand = (ev, command, usage, commandArgsRendered) => {
        const schedule = {
            commandId: command.id,
            projectId: projectId,
            argumentValues: CommandService.generateEntryPoint(projectId, command, usage) + " " + commandArgsRendered,
            cronExpression: cronExpression,
        };

        requestCommandSchedulePost(command.id, schedule)
            .then((resp) => {
                if (resp.status === StatusCodes.CREATED) {
                    setCronExpression("");
                    actionCompletedToast(`The schedule has been saved.`);
                } else {
                    errorToast("The schedule could not be saved. Review the form data or check the application logs.");
                }
            })
            .catch((reason) => {
                errorToast(reason);
            });
    };

    useEffect(() => {
        if (isAgentsLoading || agents.length === 0) return;
        setAgent(agents[0]);
    }, [isAgentsLoading]);

    useEffect(() => {
        setCommandArgsRendered(CommandService.renderArguments(projectId, command, commandArgs));
    }, [commandArgs, projectId, command]);

    return (
        <>
            <h5 className="title is-5">
                <Bullet /> Fill in the arguments
            </h5>
            {Object.keys(commandArgs).length > 0 &&
                Object.keys(commandArgs).map((key) => (
                    <p key={`command_${key}`}>
                        <label htmlFor="commandArg">{commandArgs[key].name}</label> <br />
                        <NativeInput
                            id="commandArg"
                            name={commandArgs[key].name}
                            value={commandArgs[key].placeholder}
                            onChange={(ev) => onArgUpdate(ev, usage)}
                        />
                    </p>
                ))}
            {Object.keys(commandArgs).length === 0 && <p>No arguments required.</p>}

            <h5 className="title is-5">
                <Bullet /> Configure run
            </h5>

            <HorizontalLabelledField
                label="Project"
                htmlFor="projectId"
                control={
                    <NativeSelect id="projectId" name="project_id" onChange={(ev) => setProjectId(parseInt(ev.target.value) || null)} value={projectId || ""}>
                        <option value="">(select project)</option>
                        {projects?.data?.map((project) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                    </NativeSelect>
                }
            />

            {!forcedRunFrequency && (
                <HorizontalLabelledField
                    label="Run frequency"
                    control={
                        <NativeSelect onChange={(ev) => setRunFrequency(ev.target.value)} value={runFrequency}>
                            <option value="once">Once</option>
                            <option value="on_schedule">On schedule</option>
                        </NativeSelect>
                    }
                />
            )}

            {runFrequency === "on_schedule" && (
                <>
                    <HorizontalLabelledField
                        label={
                            <>
                                Cron expression{" "}
                                <div style={{ fontWeight: "normal", fontSize: "0.8em" }}>
                                    Learn about cron expressions{" "}
                                    <ExternalLink href="https://en.wikipedia.org/wiki/Cron#CRON_expression">
                                        here
                                    </ExternalLink>
                                </div>
                            </>
                        }
                        htmlFor="cronExpression"
                        control={
                            <>
                                <NativeInput
                                    id="cronExpression"
                                    name="cronExpression"
                                    type="text"
                                    placeholder="*/1 * * * *"
                                    size="10"
                                    value={cronExpression}
                                    onChange={onCronExpressionChange}
                                />
                                <div>{cronExpressionErrorMessage}</div>
                            </>
                        }
                    />

                    <NativeButton
                        disabled={cronExpression === "" || !projectId}
                        onClick={(ev) => saveScheduledCommand(ev, command, usage, commandArgsRendered)}
                    >
                        Save scheduled command
                    </NativeButton>
                </>
            )}

            {runFrequency === "once" && (
                <>
                    <HorizontalLabelledField
                        label="Agent"
                        control={
                            <NativeSelect onChange={(ev) => { console.dir(agents); setAgent(agents.find((a) => a.id === parseInt(ev.target.value))) }}>
                                {agents?.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.clientId} - {agent.hostname} ({agent.ip})
                                    </option>
                                ))}
                            </NativeSelect>
                        }
                    />

                    <NativeButton onClick={runOnTerminal} disabled={isAgentsLoading || agents.length === 0 || !projectId} title={isAgentsLoading || agents.length === 0 ? "No available agents" : !projectId ? "Please select a project" : ""}>Run on a browser terminal</NativeButton>

                    {showTerminal && (
                        <CommandTerminal agentIp={agent?.ip} agentPort={agent?.listenAddr}
                            commands={[
                                CommandService.generateEntryPoint(projectId, command, usage) +
                                " " +
                                commandArgsRendered,
                            ]}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default CommandInstructions;
