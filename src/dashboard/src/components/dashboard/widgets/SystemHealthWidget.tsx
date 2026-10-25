import { useSystemHealthQuery } from "api/system";
import HealthStatus, { toHealthState } from "components/system/HealthStatus";
import { SseContext } from "contexts/SseContext";
import { useContext } from "react";
import { Link } from "react-router";
import { SystemUrls } from "AppUrls";
import convertReadyStateToText from "utilities/WebsocketState";
import DashboardWidget from "./DashboardWidget";

const SystemHealthWidget = () => {
    const sseContextData = useContext(SseContext);
    const { data: health, isError } = useSystemHealthQuery();

    return (
        <DashboardWidget title="System health">
            {isError && <p className="has-text-danger">Unable to load system health.</p>}
            {health && (
                <>
                    <dl>
                        <dt>REST API</dt>
                        <dd>
                            <HealthStatus state="up" />
                        </dd>

                        <dt>Database server</dt>
                        <dd>
                            <HealthStatus state={toHealthState(health.databaseServer.reachable)} latencyMs={health.databaseServer.latencyMs} />
                        </dd>

                        <dt>Key-value server</dt>
                        <dd>
                            <HealthStatus state={toHealthState(health.keyValueServer.reachable)} latencyMs={health.keyValueServer.latencyMs} />
                        </dd>

                        <dt>Message queue server</dt>
                        <dd>
                            <HealthStatus state={toHealthState(health.messageQueueServer.reachable)} latencyMs={health.messageQueueServer.latencyMs} />
                        </dd>

                        <dt>MCP server</dt>
                        <dd>
                            <HealthStatus
                                state={health.mcpServer.configured ? toHealthState(health.mcpServer.reachable) : "unknown"}
                                latencyMs={health.mcpServer.latencyMs}
                            />
                        </dd>

                        <dt>SSE notifications server</dt>
                        <dd>{convertReadyStateToText(sseContextData.connection)}</dd>

                        <dt>Attachments storage is writeable</dt>
                        <dd>
                            <HealthStatus state={toHealthState(health.attachmentsDirectory)} upLabel="Yes" downLabel="No" />
                        </dd>
                    </dl>
                    <Link to={SystemUrls.Health}>View details</Link>
                </>
            )}
        </DashboardWidget>
    );
};

export default SystemHealthWidget;
