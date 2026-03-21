import { requestCommandOutputPost, useCommandsQuery, useCommandUsagesQuery } from "api/commands.js";
import { useProjectsQuery } from "api/projects.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeSelect from "components/form/NativeSelect.jsx";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AttachmentsDropzone from "../attachments/Dropzone.jsx";
import CommandInstructions from "../commands/Instructions.jsx";
import ScheduledRuns from "../commands/ScheduledRuns.jsx";

const ScansPage = ({ mode }) => {
    const [t] = useTranslation();
    const [selectedCommandId, setSelectedCommandId] = useState(null);
    const [selectedCommandUsageId, setSelectedCommandUsageId] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const { data: commands, isLoading: isCommandsLoading } = useCommandsQuery({ limit: 1000 });
    const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery({ isTemplate: false, status: "active" });
    const { data: commandUsages } = useCommandUsagesQuery(selectedCommandId);

    useEffect(() => {
        if (projects?.data?.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects.data[0].id);
        }
    }, [projects, selectedProjectId]);

    if (isCommandsLoading || isProjectsLoading) return <Loading />;

    const onCommandChange = (ev) => {
        setSelectedCommandId(parseInt(ev.target.value));
        setSelectedCommandUsageId(null);
    };

    const onCommandUsageChange = (ev) => {
        setSelectedCommandUsageId(parseInt(ev.target.value));
    };

    const onProjectChange = (ev) => {
        setSelectedProjectId(parseInt(ev.target.value));
    };

    const selectedCommand = commands?.data.find((c) => c.id === selectedCommandId);

    const getTitle = () => {
        switch (mode) {
            case "once": return t("Run once");
            case "on_schedule": return t("Run on schedule");
            case "schedules": return t("Scheduled scans");
            case "import": return t("Import scan");
            default: return t("Scans");
        }
    };

    const dropzoneExtraParams = {};
    if (selectedProjectId) dropzoneExtraParams.projectId = selectedProjectId;
    if (selectedCommandUsageId) dropzoneExtraParams.commandUsageId = selectedCommandUsageId;

    return (
        <div>
            <Title title={getTitle()} />

            {mode === "import" && (
                <div className="content">
                    <HorizontalLabelledField
                        label={t("Project")}
                        control={
                            <NativeSelect onChange={onProjectChange} value={selectedProjectId || ""}>
                                <option value="">{t("(select project)")}</option>
                                {projects?.data.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        }
                    />

                    <HorizontalLabelledField
                        label={t("Command (optional)")}
                        control={
                            <NativeSelect onChange={onCommandChange} value={selectedCommandId || ""}>
                                <option value="">{t("(select command)")}</option>
                                {commands?.data.map((command) => (
                                    <option key={command.id} value={command.id}>
                                        {command.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        }
                    />

                    {selectedCommandId && (
                        <HorizontalLabelledField
                            label={t("Command usage")}
                            control={
                                <NativeSelect onChange={onCommandUsageChange} value={selectedCommandUsageId || ""}>
                                    <option value="">{t("(select usage)")}</option>
                                    {commandUsages?.map((usage) => (
                                        <option key={usage.id} value={usage.id}>
                                            {usage.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            }
                        />
                    )}

                    <div className="mt-4">
                        <label className="label">{t("Scan file")}</label>
                        {selectedProjectId ? (
                            <AttachmentsDropzone
                                uploadFn={requestCommandOutputPost}
                                fileFieldName="resultFile"
                                extraParams={dropzoneExtraParams}
                                disabled={!selectedCommandUsageId}
                            />
                        ) : (
                            <p className="has-text-grey">{t("Please select a project first.")}</p>
                        )}
                    </div>
                </div>
            )}

            {mode === "schedules" && (
                <article className="mt-4 content">
                    <ScheduledRuns />
                </article>
            )}

            {(mode === "once" || mode === "on_schedule") && (
                <>
                    <div className="field">
                        <label className="label">{t("Select command")}</label>
                        <div className="control">
                            <NativeSelect onChange={onCommandChange} value={selectedCommandId || ""}>
                                <option value="">{t("(select command)")}</option>
                                {commands?.data.map((command) => (
                                    <option key={command.id} value={command.id}>
                                        {command.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                    {selectedCommand && (
                        <article className="mt-4 content">
                            {mode === "once" && <CommandInstructions command={selectedCommand} forcedRunFrequency="once" />}
                            {mode === "on_schedule" && <CommandInstructions command={selectedCommand} forcedRunFrequency="on_schedule" />}

                        </article>
                    )}
                </>
            )}
        </div>
    );
};

export default ScansPage;
