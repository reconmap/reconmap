import { useRunnersQuery } from "api/runners.js";
import { requestRunnerDelete } from "api/requests/runners.js";
import NativeButton from "components/forms/NativeButton.jsx";
import NativeButtonGroup from "components/forms/NativeButtonGroup.jsx";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import CreateButton from "components/ui/buttons/Create.jsx";
import Title from "components/ui/Title";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { useNavigate, Link } from "react-router-dom";
import { RunnersUrls } from "AppUrls";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now - lastPingDate) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}

const RunnersListPage = () => {
    const navigate = useNavigate();
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
                    <button className="button is-danger is-small" onClick={() => {
                        if (window.confirm("Are you sure you want to delete this runner?")) {
                            requestRunnerDelete(runner.id).then((response) => {
                                if (response.ok) {
                                    refetch();
                                    alert("Runner deleted successfully");
                                } else {
                                    alert("Failed to delete runner");
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
                <CreateButton onClick={() => navigate(RunnersUrls.Create)}>Add runner</CreateButton>
            </NativeButtonGroup>
        </div>
        <Title title="Runners" />

        <NativeTable columns={columns} rows={isLoading ? null : runners} rowId={(runner) => runner.id}></NativeTable>
    </>
}

export default RunnersListPage;
