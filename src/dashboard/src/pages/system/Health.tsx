import { useSystemHealthQuery } from "api/system";
import HealthStatus, { toHealthState } from "components/system/HealthStatus";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { SseContext } from "contexts/SseContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import convertReadyStateToText from "utilities/WebsocketState";

const SystemHealthPage = () => {
    const [t] = useTranslation();
    const sseContextData = useContext(SseContext);
    const { data: health, isLoading } = useSystemHealthQuery();

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("System health")} />

            {!isLoading && health && (
                <table className="table">
                    <tbody>
                        <tr>
                            <td>Rest API</td>
                            <td width="20%">
                                <HealthStatus state="up" />
                            </td>
                        </tr>
                        <tr>
                            <td>Database server</td>
                            <td>
                                <HealthStatus state={toHealthState(health.databaseServer.reachable)} latencyMs={health.databaseServer.latencyMs} />
                            </td>
                        </tr>
                        <tr>
                            <td>Key-value server</td>
                            <td>
                                <HealthStatus state={toHealthState(health.keyValueServer.reachable)} latencyMs={health.keyValueServer.latencyMs} />
                            </td>
                        </tr>
                        <tr>
                            <td>Message queue server</td>
                            <td>
                                <HealthStatus state={toHealthState(health.messageQueueServer.reachable)} latencyMs={health.messageQueueServer.latencyMs} />
                            </td>
                        </tr>
                        <tr>
                            <td>MCP server</td>
                            <td>
                                <HealthStatus
                                    state={health.mcpServer.configured ? toHealthState(health.mcpServer.reachable) : "unknown"}
                                    latencyMs={health.mcpServer.latencyMs}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>SSE notifications server</td>
                            <td>{convertReadyStateToText(sseContextData.connection)}</td>
                        </tr>
                        <tr>
                            <td>Attachments storage is writeable</td>
                            <td>
                                <HealthStatus state={toHealthState(health.attachmentsDirectory)} upLabel="Yes" downLabel="No" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default SystemHealthPage;
