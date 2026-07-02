import { useCommandsQuery, useCommandUsagesQuery } from "api/commands.js";
import { useProjectsQuery } from "api/projects.js";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect.jsx";
import CommandInstructions from "components/commands/Instructions.jsx";
import Loading from "components/ui/Loading.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import { useEffect, useMemo, useState } from "react";
import { ensureUrlAsset, getUrlCapableUsages } from "services/scans/url";

const UrlScanLauncher = () => {
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedCommandId, setSelectedCommandId] = useState(null);
    const [scanUrl, setScanUrl] = useState("");
    const [isPrepared, setIsPrepared] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: commands, isLoading: isCommandsLoading } = useCommandsQuery({ limit: 1000 });
    const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery({ isTemplate: false, status: "active" });
    const { data: commandUsages, isLoading: isCommandUsagesLoading } = useCommandUsagesQuery(selectedCommandId);

    useEffect(() => {
        if (projects?.data?.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects.data[0].id);
        }
    }, [projects, selectedProjectId]);

    useEffect(() => {
        setIsPrepared(false);
    }, [selectedProjectId, selectedCommandId, scanUrl]);

    const selectedCommand = useMemo(() => commands?.data?.find((command) => command.id === selectedCommandId) ?? null, [commands, selectedCommandId]);
    const urlCapableUsages = useMemo(() => getUrlCapableUsages(commandUsages ?? []), [commandUsages]);
    const selectedUsageId = urlCapableUsages[0]?.id ?? null;

    if (isCommandsLoading || isProjectsLoading) return <Loading />;

    const onProjectChange = (ev) => {
        setSelectedProjectId(parseInt(ev.target.value) || null);
    };

    const onCommandChange = (ev) => {
        setSelectedCommandId(ev.target.value || null);
    };

    const onStartScan = async (ev) => {
        ev.preventDefault();

        if (!selectedProjectId) {
            errorToast("Please select a project.");
            return;
        }

        if (!scanUrl.trim()) {
            errorToast("Please enter a URL.");
            return;
        }

        if (!selectedCommand || selectedUsageId == null) {
            errorToast("Please choose a command that accepts a URL.");
            return;
        }

        setIsSubmitting(true);
        try {
            await ensureUrlAsset(selectedProjectId, scanUrl);
            setIsPrepared(true);
            actionCompletedToast("The URL asset is ready and the scan command has been prepared.");
        } catch (err) {
            errorToast(err?.message || "The URL asset could not be prepared.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content">
            <form onSubmit={onStartScan}>
                <div className="field">
                    <label className="label" htmlFor="projectId">Project</label>
                    <div className="control">
                        <NativeSelect id="projectId" onChange={onProjectChange} value={selectedProjectId || ""}>
                            <option value="">(select project)</option>
                            {projects?.data.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>

                <div className="field">
                    <label className="label" htmlFor="scanUrl">URL</label>
                    <div className="control">
                        <NativeInput
                            id="scanUrl"
                            name="scanUrl"
                            type="url"
                            placeholder="https://example.com"
                            value={scanUrl}
                            onChange={(ev) => setScanUrl(ev.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="label" htmlFor="commandId">Command</label>
                    <div className="control">
                        <NativeSelect id="commandId" onChange={onCommandChange} value={selectedCommandId || ""}>
                            <option value="">(select command)</option>
                            {commands?.data.map((command) => (
                                <option key={command.id} value={command.id}>
                                    {command.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>

                {selectedCommand && commandUsages && urlCapableUsages.length === 0 && (
                    <p className="has-text-warning">This command does not expose a URL placeholder in any usage.</p>
                )}

                <div className="field mt-4">
                    <div className="control">
                        <PrimaryButton type="submit" disabled={isSubmitting || !selectedCommand || urlCapableUsages.length === 0}>
                            {isSubmitting ? "Preparing..." : "Start scan"}
                        </PrimaryButton>
                        <NativeButton type="button" onClick={() => setIsPrepared(false)} disabled={!isPrepared}>
                            Reset
                        </NativeButton>
                    </div>
                </div>
            </form>

            {isCommandUsagesLoading && <Loading />}

            {isPrepared && selectedCommand && selectedUsageId && (
                <article className="mt-5 content">
                    <CommandInstructions
                        command={selectedCommand}
                        projectId={selectedProjectId}
                        forcedRunFrequency="once"
                        defaultUsageId={selectedUsageId}
                        defaultArgumentValues={{ URL: scanUrl.trim() }}
                    />
                </article>
            )}
        </div>
    );
};

export default UrlScanLauncher;
