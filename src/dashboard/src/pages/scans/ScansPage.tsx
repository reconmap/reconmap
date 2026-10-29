import { requestCommandOutputPost } from "api/commands";
import { useProjectsQuery } from "api/projects";
import FormField from "components/forms/FormField";
import NativeSelect from "components/forms/NativeSelect";
import Skeleton from "components/ui/Skeleton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import AttachmentsDropzone from "components/attachments/AttachmentsDropzone";
import ScheduledRuns from "components/commands/ScheduledRuns";
import ScanTargetForm from "components/scans/ScanTargetForm";
import ScanRunsList from "components/scans/ScanRunsList";

const ScansPage = ({ mode }: any) => {
    const [t] = useTranslation();
    const [chosenProjectId, setChosenProjectId] = useState<any>(null);

    const { data: projects, isLoading: isProjectsLoading } = useProjectsQuery({ isTemplate: false, status: "active" });

    // Until the user picks a project, default to the first active one.
    const selectedProjectId = chosenProjectId || projects?.data?.[0]?.id;

    const onProjectChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setChosenProjectId(event.target.value || null);
    };

    const getTitle = () => {
        switch (mode) {
            case "once": return t("Run scan");
            case "runs": return t("Scan history");
            case "schedules": return t("Scheduled scans");
            case "import": return t("Import scan");
            default: return t("Scans");
        }
    };

    const dropzoneExtraParams: any = {};
    if (selectedProjectId) dropzoneExtraParams.projectId = selectedProjectId;

    return (
        <div>
            <PageTitleHeader title={getTitle()} />

            {mode === "import" && (
                <div className="content">
                    <FormField layout="horizontal"
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
                                type="commandOutput"
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

            {mode === "once" && (
                <section className="mt-5 content">
                    <h3 className="title is-5">{t("Recent scans")}</h3>
                    <ScanRunsList limit={5} />
                </section>
            )}

            {mode === "runs" && (
                <article className="mt-4 content">
                    <ScanRunsList limit={50} />
                </article>
            )}
        </div>
    );
};

export default ScansPage;
