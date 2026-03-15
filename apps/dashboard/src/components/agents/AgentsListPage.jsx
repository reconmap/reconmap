import { useAgentsQuery } from "api/agents.js";
import { requestAgentDelete, requestAgentPost } from "api/requests/agents.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeButton from "components/form/NativeButton.jsx";
import NativeInput from "components/form/NativeInput.jsx";
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

const AgentsListPage = () => {
    const { data: agents, isLoading, refetch } = useAgentsQuery();

    const [agentCredentials, setAgentCredentials] = useState(null);

    if (isLoading) return <div>Loading&hellip;</div>;

    const onSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        requestAgentPost(data).then((response) => {
            if (response.status === 201) {
                return response.json();
            } else {
                alert("Failed to add agent");
            }
        }).then((data) => {
            if (data) {
                event.target.reset();
                setAgentCredentials(data);
                refetch();
                alert("Agent added successfully");
            }
        });
    }

    const columns = [
        {
            header: "Status",
            cell: (agent) => <>
                {pingedRecently(agent.lastPingAt) ? (<span className="tag is-success">Online</span>) : (
                    <span className="tag is-warning">Offline</span>
                )}
            </>
        },
        {
            header: "Enabled",
            cell: (agent) => (agent.active ? <>True</> : <>False</>),
            enabled: false
        },
        {
            header: "Client ID",
            cell: (agent) => (
                <>
                    <Link to={`/agents/${agent.id}`}>{agent.clientId}</Link>
                </>
            ),
        },
        {
            header: "Name",
            cell: (agent) => (
                <>
                    <Link to={`/agents/${agent.id}`}>{agent.name}</Link>
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
            cell: (agent) => (
                <>
                    <button className="button is-danger is-small" onClick={() => {
                        if (window.confirm("Are you sure you want to delete this agent?")) {
                            requestAgentDelete(agent.id).then((response) => {
                                if (response.ok) {
                                    refetch();
                                    alert("Agent deleted successfully");
                                } else {
                                    alert("Failed to delete agent");
                                }
                            });
                        }
                    }}>Delete</button>
                </>
            ),
        }
    ];

    return <>
        <NativeTable columns={columns} rows={agents} rowId={(agent) => agent.id}></NativeTable>

        {agentCredentials && (
            <div>
                The agent credentials are (please copy them as they are only displayed once):
                <pre>{JSON.stringify(agentCredentials, null, 2)}</pre>

            </div>
        )}

        <details>
            <summary>Add agent</summary>
            <form method="POST" action="/api/agents" onSubmit={onSubmit}>
                <HorizontalLabelledField label="Name" control={<NativeInput type="text" name="name" placeholder="Name" required />} />

                <HorizontalLabelledField label="Hostname" control={<NativeInput type="text" name="hostname" placeholder="Hostname" required />} />

                <HorizontalLabelledField label="Listen Address" control={<NativeInput type="text" name="listenAddr" placeholder="Listen Address" required />} />

                <NativeButton type="submit" className="button is-primary">Add new agent</NativeButton>
            </form>
        </details>
    </>
}

export default AgentsListPage;
