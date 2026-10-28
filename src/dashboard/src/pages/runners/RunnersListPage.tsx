import { requestRunnerDelete } from "api/requests/runners";
import { useRunnersQuery } from "api/runners";
import { RunnersUrls } from "AppUrls";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/CreateButton";
import PageTitleHeader from "components/ui/PageTitleHeader";
import NativeTable from "components/ui/tables/NativeTable";
import { toast } from "components/ui/toast";
import { useConfirm } from "components/ui/useConfirm";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastPingDate.getTime()) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}

const RunnersListPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();
    const { data: runners, isLoading, isFetching, refetch } = useRunnersQuery();

    const columns = [
        {
            header: "Status",
            cell: (runner) => <>
                {pingedRecently(runner.lastPingAt) ? (<span className="tag is-success">Online</span>) : (
                    <span className="tag is-warning">Offline</span>
                )}
            </>
        },
        {
            header: "Enabled",
            cell: (runner) => (runner.active ? <>True</> : <>False</>),
            enabled: false
        },
        {
            header: "Client ID",
            cell: (runner) => (
                <>
                    <Link to={`/runners/${runner.id}`}>{runner.clientId}</Link>
                </>
            ),
        },
        {
            header: "Name",
            cell: (runner) => (
                <>
                    <Link to={`/runners/${runner.id}`}>{runner.name}</Link>
                </>
            ),
        },
        {
            header: "Hostname",
            property: "hostname",
        },
        {
            header: "OS",
            property: "os",
        },
        {
            header: "Arch",
            property: "arch",
        },
        {
            header: "CPU",
            property: "cpu",
        },
        {
            header: "Mem",
            property: "memory",
        },
        {
            header: "IP",
            property: "ip",
        },
        {
            header: "Listen address",
            property: "listenAddr",
        },
        {
            header: "Last boot at",
            property: "lastBootAt",
        },
        {
            header: "Last ping at",
            property: "lastPingAt",
        },
        {
            header: "",
            cell: (runner) => (
                <>
                    <button className="button is-danger is-small" onClick={async () => {
                        if (await confirm("Are you sure you want to delete this runner?")) {
                            requestRunnerDelete(runner.id).then((response) => {
                                if (response.ok) {
                                    refetch();
                                    toast.success("Runner deleted successfully");
                                } else {
                                    toast.error("Failed to delete runner");
                                }
                            });
                        }
                    }}>Delete</button>
                </>
            ),
        }
    ];

    return <>
        <div className="heading">
            <Breadcrumb />
            <NativeButtonGroup>
                <NativeButton onClick={() => refetch()} disabled={isFetching}>Refresh</NativeButton>
                <CreateButton onClick={() => navigate(RunnersUrls.Create)}>New runner</CreateButton>
            </NativeButtonGroup>
        </div>
        <PageTitleHeader title={t("Runners")} />

        <NativeTable columns={columns} rows={isLoading ? null : runners} rowId={(runner) => runner.id}></NativeTable>
        {confirmDialog}
    </>
}

export default RunnersListPage;
