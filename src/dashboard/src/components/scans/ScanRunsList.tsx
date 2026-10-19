import { useScanRunsQuery } from "api/scans";
import { isScanRunActive } from "api/requests/scans";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import NativeTable from "components/ui/tables/NativeTable";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ScansUrls } from "AppUrls";
import ScanStatusTag from "./ScanStatusTag";

const ScanRunsList = ({ limit = 20, projectId }: { limit?: number; projectId?: number }) => {
    const { t } = useTranslation();
    const { data: runs } = useScanRunsQuery({ limit, projectId });

    const activeRuns = runs?.filter((run) => isScanRunActive(run)) ?? [];

    const columns = [
        {
            header: t("Target"),
            cell: (run) => <Link to={`${ScansUrls.Runs}/${run.id}`}>{run.target}</Link>,
        },
        { header: t("Objective"), cell: (run) => run.objective },
        {
            header: t("Tools"),
            cell: (run) => `${run.tasks.filter((task) => task.status === "succeeded" || task.status === "failed").length}/${run.tasks.length}`,
        },
        { header: t("Status"), cell: (run) => <ScanStatusTag status={run.status} /> },
        { header: t("Started"), cell: (run) => <RelativeDateFormatter date={run.createdAt} /> },
    ];

    return (
        <>
            {activeRuns.length > 0 && (
                <div className="notification is-info is-light">
                    {t("{{count}} scan(s) in progress.", { count: activeRuns.length })}{" "}
                    {activeRuns.map((run) => (
                        <Link key={run.id} className="mr-2" to={`${ScansUrls.Runs}/${run.id}`}>
                            {run.target}
                        </Link>
                    ))}
                </div>
            )}
            <NativeTable rows={runs} rowId={(run) => run.id} columns={columns} emptyRowsMessage={t("No scans have been run yet.")} />
        </>
    );
};

export default ScanRunsList;
