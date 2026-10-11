import { useRunnersQuery } from "api/runners.js";
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
import { useAuth } from "contexts/AuthContext";
import { hasRunnerTerminalAccess } from "services/auth";

const Bullet = () => <span style={{ color: "var(--bulma-primary" }}>▸</span>;

const CommandInstructions = ({ command, projectId = null, forcedRunFrequency = null, defaultUsageId = null, defaultArgumentValues = null }) => {
    const { data: commandUsages } = useCommandUsagesQuery(command?.id);

    const [usage, setUsage] = useState(null);

    useEffect(() => {
        const usages = commandUsages ?? [];

        if (defaultUsageId) {
            const defaultUsage = usages.find((usage) => usage.id === defaultUsageId);
            if (defaultUsage) {
                setUsage(defaultUsage);
                return;
            }
        }

        if (usage === null && usages.length > 0) {
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
    const { user } = useAuth();
    const terminalAllowed = hasRunnerTerminalAccess(user);
    const [commandArgsRendered, setCommandArgsRendered] = useState("");
    const [commandArgs, setCommandArgs] = useState(() => parseArguments(usage));
    const [showTerminal, setShowTerminal] = useState(false);
    const [runFrequency, setRunFrequency] = useState(forcedRunFrequency || "once");
    const [projectId, setProjectId] = useState(parentProjectId ?? null);
    const [runner, setRunner] = useState(null);
    const { data: projects } = useProjectsQuery({ isTemplate: false, status: "active" });
    const { data: runners, isLoading: isRunnersLoading } = useRunnersQuery();

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
        if (isRunnersLoading || runners.length === 0) return;
        setRunner(runners[0]);
    }, [isRunnersLoading]);

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

            {runFrequency === "once" && terminalAllowed && (
                <>
                    <HorizontalLabelledField
                        label="Runner"
                        control={
                            <NativeSelect onChange={(ev) => { console.dir(runners); setRunner(runners.find((a) => a.id === parseInt(ev.target.value))) }}>
                                {runners?.map((runner) => (
                                    <option key={runner.id} value={runner.id}>
                                        {runner.clientId} - {runner.hostname} ({runner.ip})
                                    </option>
                                ))}
                            </NativeSelect>
                        }
                    />

                    <NativeButton onClick={runOnTerminal} disabled={isRunnersLoading || runners.length === 0 || !projectId} title={isRunnersLoading || runners.length === 0 ? "No available runners" : !projectId ? "Please select a project" : ""}>Run on a browser terminal</NativeButton>

                    {showTerminal && (
                        <CommandTerminal runnerIp={runner?.ip} runnerPort={runner?.listenAddr}
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
