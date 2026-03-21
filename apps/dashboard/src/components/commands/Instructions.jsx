import { useAgentsQuery } from "api/agents.js";
import { useCommandUsagesQuery } from "api/commands.js";
import { useProjectsQuery } from "api/projects.js";
import { requestCommandSchedulePost } from "api/requests/commands.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeButton from "components/form/NativeButton";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect.jsx";
import CommandTerminal from "components/ui/CommandTerminal";
import ExternalLink from "components/ui/ExternalLink";
import ShellCommand from "components/ui/ShellCommand";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import cronstrue from "cronstrue";
import { StatusCodes } from "http-status-codes";
import { useEffect, useState } from "react";
import { CliDownloadUrl } from "ServerUrls";
import CommandService from "services/command";
import parseArguments from "services/commands/arguments";

const Bullet = () => <span style={{ color: "var(--bulma-primary" }}>▸</span>;

const CommandInstructions = ({ command, projectId = null, forcedRunFrequency = null }) => {
    const { data: commandUsages } = useCommandUsagesQuery(command?.id);

    const [usage, setUsage] = useState(null);

    const onUsageChange = (ev) => {
        const usage = commandUsages.find((usage) => usage.id === parseInt(ev.target.value));
        setUsage(usage || null);
    };

    if (commandUsages == null) {
        return (
            <>
                <p>This command has no instructions defined.</p>
            </>
        );
    }

    return (
        <>
            <NativeSelect onChange={(ev) => onUsageChange(ev)}>
                <option value="0">(select)</option>
                {commandUsages.map((usage) => (
                    <option key={usage.id} value={usage.id}>
                        {usage.name}
                    </option>
                ))}
            </NativeSelect>

            {usage !== null && (
                <>
                    <h4 className="title is-4">Instructions for command "{command.name}"</h4>
                    <UsageDetail projectId={projectId} command={command} usage={usage} forcedRunFrequency={forcedRunFrequency} />
                </>
            )}
        </>
    );
};

const UsageDetail = ({ projectId: parentProjectId, command, usage, forcedRunFrequency = null }) => {
    const [commandArgsRendered, setCommandArgsRendered] = useState("");
    const [commandArgs, setCommandArgs] = useState(parseArguments(usage));
    const [findingsStorageAction, setFindingsStorageAction] = useState("discard");
    const [showTerminal, setShowTerminal] = useState(false);
    const [runFrequency, setRunFrequency] = useState(forcedRunFrequency || "once");
    const [projectId, setProjectId] = useState(null);
    const [terminalEnvironment, setTerminalEnvironment] = useState("desktop");
    const [agent, setAgent] = useState(null);
    const { data: projects } = useProjectsQuery({ isTemplate: false, status: "active" });
    const { data: agents, isLoading: isAgentsLoading } = useAgentsQuery();

    useEffect(() => {
        if (forcedRunFrequency) {
            setRunFrequency(forcedRunFrequency);
        }
    }, [forcedRunFrequency]);

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
                label="Findings storage action"
                control={
                    <NativeSelect
                        onChange={(ev) => {
                            setFindingsStorageAction(ev.target.value);
                            if (ev.target.value === "discard") {
                                setProjectId(null);
                            } else {
                                setProjectId(projects.data[0].id);
                            }
                        }}
                    >
                        <option value="discard">Discard (only captures output)</option>
                        <option value="project">Project</option>
                    </NativeSelect>
                }
            />

            {findingsStorageAction === "project" && (
                <HorizontalLabelledField
                    label="Project"
                    htmlFor="projectId"
                    control={
                        <NativeSelect id="projectId" name="project_id" onChange={(ev) => setProjectId(ev.target.value)}>
                            {projects.data.map((project) => (
                                <option value={project.id}>{project.name}</option>
                            ))}
                        </NativeSelect>
                    }
                />
            )}

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
                        disabled={cronExpression === ""}
                        onClick={(ev) => saveScheduledCommand(ev, command, usage, commandArgsRendered)}
                    >
                        Save scheduled command
                    </NativeButton>
                </>
            )}

            {runFrequency === "once" && (
                <>
                    <HorizontalLabelledField
                        label="Terminal environment"
                        control={
                            <NativeSelect onChange={(ev) => setTerminalEnvironment(ev.target.value)}>
                                <option value="desktop">Desktop</option>
                                <option value="browser" disabled={isAgentsLoading || agents.length === 0} title={isAgentsLoading || agents.length === 0 ? "No available agents" : ""}>Browser</option>
                            </NativeSelect>
                        }
                    />
                </>
            )}

            {runFrequency === "once" && terminalEnvironment === "browser" && (
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

                    <NativeButton onClick={runOnTerminal}>Run on a browser terminal</NativeButton>

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

            {runFrequency === "once" && terminalEnvironment === "desktop" && (
                <>
                    <h5 className="title is-5">
                        <Bullet /> Execute <strong>rmap</strong> on any terminal
                    </h5>
                    <div>
                        Make sure you have a copy of <strong>rmap</strong> on a machine you trust. Download the CLI for
                        Macos/Linux and Windows from <ExternalLink href={CliDownloadUrl}>Github</ExternalLink>.<br />
                        Once <strong>rmap</strong> is within reach execute the command shown below.
                        <ShellCommand>
                            {CommandService.generateEntryPoint(projectId, command, usage)} {commandArgsRendered}
                        </ShellCommand>
                    </div>

                    <h5 className="title is-5">
                        <Bullet /> Wait for results
                    </h5>

                    <div>
                        The <strong>rmap</strong> command will automatically capture the output of the previous command
                        and upload it to the server for analysis. If there are new hosts discovered, or new
                        vulnerabilities detected, they will be reported in the dashboard.
                    </div>
                </>
            )}
        </>
    );
};

export default CommandInstructions;
