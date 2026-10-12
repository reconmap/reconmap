import { requestCommandOutputPost } from "api/commands";
import { useProjectsQuery } from "api/projects";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeSelect from "components/forms/NativeSelect";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AttachmentsDropzone from "components/attachments/Dropzone";
import ScheduledRuns from "components/commands/ScheduledRuns";
import ScanTargetForm from "components/scans/ScanTargetForm";

const ScansPage = ({ mode }: any) => {
    const [t] = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState<any>(null);

    const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery({ isTemplate: false, status: "active" });

    useEffect(() => {
        if (projects?.data?.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects.data[0].id);
        }
    }, [projects, selectedProjectId]);

    if (isProjectsLoading) return <Loading />;

    const onProjectChange = (ev) => {
        setSelectedProjectId(parseInt(ev.target.value) || null);
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

                    <div className="mt-4">
                        <label className="label">{t("Scan file")}</label>
                        {selectedProjectId ? (
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
