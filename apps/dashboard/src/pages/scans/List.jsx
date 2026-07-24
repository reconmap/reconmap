import { requestCommandOutputPost } from "api/commands.js";
import { useProjectsQuery } from "api/projects.js";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField.jsx";
import NativeSelect from "components/forms/NativeSelect.jsx";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AttachmentsDropzone from "components/attachments/Dropzone.jsx";
import ScheduledRuns from "components/commands/ScheduledRuns.jsx";
import ScanTargetForm from "components/scans/ScanTargetForm.jsx";

const ScansPage = ({ mode }) => {
    const [t] = useTranslation();
    const [selectedProjectId, setSelectedProjectId] = useState(null);

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

    const dropzoneExtraParams = {};
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
