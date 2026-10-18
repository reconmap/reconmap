import { requestCommandOutputPost } from "api/commands";
import { useProjectsQuery } from "api/projects";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeSelect from "components/forms/NativeSelect";
import Skeleton from "components/ui/Skeleton";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AttachmentsDropzone from "components/attachments/Dropzone";
import ScheduledRuns from "components/commands/ScheduledRuns";
import ScanTargetForm from "components/scans/ScanTargetForm";

const ScansPage = ({ mode }: any) => {
    const [t] = useTranslation();
    const [chosenProjectId, setChosenProjectId] = useState<any>(null);

    const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery({ isTemplate: false, status: "active" });

    // Until the user picks a project, default to the first active one.
    const selectedProjectId = chosenProjectId || projects?.data?.[0]?.id;

    const onProjectChange = (ev) => {
        setChosenProjectId(parseInt(ev.target.value) || null);
    };

    const getTitle = () => {
        switch (mode) {
            case "once": return t("Run scan");
            case "schedules": return t("Scheduled scans");
            case "import": return t("Import scan");
            default: return t("Scans");
        }
    };

    const dropzoneExtraParams: any = {};
    if (selectedProjectId) dropzoneExtraParams.projectId = selectedProjectId;

    return (
        <div>
            <Title title={getTitle()} />

            {mode === "import" && (
                <div className="content">
                    <HorizontalLabelledField
                        label={t("Project")}
                        control={
                            <NativeSelect onChange={onProjectChange} value={selectedProjectId || ""} disabled={isProjectsLoading}>
                                <option value="">{isProjectsLoading ? t("Loading...") : t("(select project)")}</option>
                                {projects?.data.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        }
                    />

                    <div className="mt-4">
                        <label className="label">{t("Scan file")}</label>
                        {isProjectsLoading ? (
                            <Skeleton height="8rem" />
                        ) : selectedProjectId ? (
                            <AttachmentsDropzone
                                uploadFn={requestCommandOutputPost}
                                fileFieldName="resultFile"
                                extraParams={dropzoneExtraParams}
                                disabled={false}
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

            {mode === "once" && (
                <article className="mt-4 content">
                    <ScanTargetForm />
                </article>
            )}
        </div>
    );
};

export default ScansPage;
