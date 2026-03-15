import { useSystemHealthQuery } from "api/system.js";
import Title from "components/ui/Title";
import { WebsocketContext } from "contexts/WebsocketContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import convertReadyStateToText from "utilities/WebsocketState";
import Breadcrumb from "../ui/Breadcrumb.jsx";

const GreenYes = ({ label = "Yes" }) => <span style={{ color: "green" }}>{label}</span>;
const RedNo = () => <span style={{ color: "red" }}>No</span>;

const SystemHealthPage = () => {
    const [t] = useTranslation();
    const wsContextData = useContext(WebsocketContext);
    const { data: apiHealth, isLoading } = useSystemHealthQuery();

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
            </div>
            <Title title={t("System health")} />

            {!isLoading && (
                <>
                    <table className="table">
                        <caption>API health</caption>
                        <tbody>
                            <tr>
                                <td>Rest API</td>
                                <td width="20%">
                                    <GreenYes label="Ok" />
                                </td>
                            </tr>
                            <tr>
                                <td>Database server</td>
                                <td>{apiHealth.databaseServer.reachable ? <GreenYes label="Ok" /> : <RedNo />}</td>
                            </tr>
                            <tr>
                                <td>Key-value server</td>
                                <td>{apiHealth.keyValueServer.reachable ? <GreenYes label="Ok" /> : <RedNo />}</td>
                            </tr>
                            <tr>
                                <td>WebSocket server</td>
                                <td>{convertReadyStateToText(wsContextData.connection)}</td>
                            </tr>
                            <tr>
                                <td>Attachments directory exists</td>
                                <td>{apiHealth.attachmentsDirectory.exists ? <GreenYes /> : <RedNo />}</td>
                            </tr>
                            <tr>
                                <td>Attachments directory is writeable</td>
                                <td>{apiHealth.attachmentsDirectory.writeable ? <GreenYes /> : <RedNo />}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default SystemHealthPage;
