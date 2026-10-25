import { useScanRunQuery } from "api/scans";
import { isScanRunActive } from "api/requests/scans";
import ScanStatusTag from "components/scans/ScanStatusTag";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import Skeleton from "components/ui/Skeleton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { ScansUrls } from "AppUrls";

const ScanRunDetailsPage = () => {
    const { t } = useTranslation();
    const { runId } = useParams();
    const { data: run, isLoading, isError } = useScanRunQuery(runId!);

    if (isLoading) {
        return (
            <div>
                <PageTitleHeader title={t("Scan")} />
                <Skeleton height="8rem" />
            </div>
        );
    }

    if (isError || !run) {
        return (
            <div>
                <PageTitleHeader title={t("Scan")} />
                <div className="notification is-danger is-light">{t("The scan could not be loaded.")}</div>
            </div>
        );
    }

    return (
        <div>
            <PageTitleHeader title={run.target} subHeader={t("Scan")} />

            <div className="content">
                <p>
                    <ScanStatusTag status={run.status} /> <span className="ml-2">{run.objective}</span>
                    {run.createdAt && (
                        <span className="ml-2 has-text-grey">
                            <RelativeDateFormatter date={run.createdAt} />
                        </span>
                    )}
                </p>
                {isScanRunActive(run) && (
                    <p className="has-text-grey">{t("This scan keeps running if you leave this page. Come back any time from Scan history.")}</p>
                )}
                {run.strategy && (
                    <div className="notification is-info is-light">
                        <strong>{t("Strategy")}: </strong>
                        {run.strategy}
                    </div>
                )}

                <div className="columns is-multiline">
                    {run.tasks.map((task) => (
                        <div key={task.id} className="column is-12">
                            <div className="card">
                                <div className="card-content">
                                    <div className="is-flex is-justify-content-space-between is-align-items-center">
                                        <div>
                                            <span className="tag is-info mr-2">#{task.position}</span>
                                            <strong>{task.commandName}</strong>
                                        </div>
                                        <ScanStatusTag status={task.status} />
                                    </div>
                                    {task.rationale && <p className="mt-2">{task.rationale}</p>}
                                    <p className="mt-2">
                                        <code>{`${task.executablePath ?? ""} ${task.arguments ?? ""}`.trim()}</code>
                                    </p>
                                    {task.error && <p className="mt-2 has-text-danger">{task.error}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Link to={ScansUrls.Runs}>{t("Back to scan history")}</Link>
            </div>
        </div>
    );
};

export default ScanRunDetailsPage;
