import { useQueryClient } from "@tanstack/react-query";
import { useSystemUsageQuery } from "api/system.js";
import NativeButton from "components/form/NativeButton.jsx";
import FileSizeSpan from "components/ui/FileSizeSpan";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../ui/Breadcrumb.jsx";

const SystemUsagePage = () => {
    const [t] = useTranslation();
    const { data: usage, isLoading } = useSystemUsageQuery();
    const queryClient = useQueryClient();
    const activeQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.isActive());

    const invalidateAllQueries = () => {
        queryClient.invalidateQueries();
    };

    if (isLoading) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb />
            </div>
            <Title type="System" title={t("System usage")} />

            <div className="content">
                <dl>
                    <dt>Attachments count</dt>
                    <dd>{usage.attachments.total_count} total</dd>
                </dl>

                <dl>
                    <dt>Attachments total disk usage</dt>
                    <dd>
                        <FileSizeSpan fileSize={usage.attachments.total_file_size} />
                    </dd>
                </dl>

                <table className="table is-stripped">
                    <thead>
                        <tr>
                            <th>Queue name</th>
                            <th>Queue length</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Emails</td>
                            <td>{usage.queueLengths.emails}</td>
                        </tr>
                        <tr>
                            <td>Tasks</td>
                            <td>{usage.queueLengths.tasks}</td>
                        </tr>
                        <tr>
                            <td>Notifications</td>
                            <td>{usage.queueLengths.notifications}</td>
                        </tr>

                        <tr>
                            <td>Client queries cached</td>
                            <td>
                                {activeQueries.length}{" "}
                                <NativeButton onClick={invalidateAllQueries}>Invalidate all queries</NativeButton>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemUsagePage;
