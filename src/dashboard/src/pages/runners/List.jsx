import { useRunnersQuery } from "api/runners.js";
import { requestRunnerDelete, requestRunnerPost } from "api/requests/runners.js";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField.jsx";
import NativeButton from "components/forms/NativeButton.jsx";
import NativeInput from "components/forms/NativeInput.jsx";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { useState } from "react";
import { Link } from "react-router-dom";

const pingedRecently = (lastPingAt) => {
    if (!lastPingAt) return false;
    const lastPingDate = new Date(lastPingAt);
    const now = new Date();
    const diffMinutes = (now - lastPingDate) / 1000 / 60;
    return diffMinutes < 5; // Consider online if pinged within the last 5 minutes
}

const RunnersListPage = () => {
    const { data: runners, isLoading, refetch } = useRunnersQuery();

    const [runnerCredentials, setRunnerCredentials] = useState(null);

    if (isLoading) return <div>Loading&hellip;</div>;

    const onSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        requestRunnerPost(data).then((response) => {
            if (response.status === 201) {
                return response.json();
            } else {
                alert("Failed to add runner");
            }
        }).then((data) => {
            if (data) {
                event.target.reset();
                setRunnerCredentials(data);
                refetch();
                alert("Runner added successfully");
            }
        });
    }

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
        <NativeTable columns={columns} rows={runners} rowId={(runner) => runner.id}></NativeTable>

        {runnerCredentials && (
            <div>
                The runner credentials are (please copy them as they are only displayed once):
                <pre>{JSON.stringify(runnerCredentials, null, 2)}</pre>

            </div>
        )}

        <details>
            <summary>Add runner</summary>
            <form method="POST" action="/api/runners" onSubmit={onSubmit}>
                <HorizontalLabelledField label="Name" control={<NativeInput type="text" name="name" placeholder="Name" required />} />

                <HorizontalLabelledField label="Hostname" control={<NativeInput type="text" name="hostname" placeholder="Hostname" required />} />

                <HorizontalLabelledField label="Listen Address" control={<NativeInput type="text" name="listenAddr" placeholder="Listen Address" required />} />

                <NativeButton type="submit" className="button is-primary">Add new runner</NativeButton>
            </form>
        </details>
    </>
}

export default RunnersListPage;
