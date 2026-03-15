import { useSystemHealthQuery } from "api/system.js";
import DashboardWidget from "./Widget";

const GreenYes = () => <span style={{ color: "green" }}>Yes</span>;
const RedNo = () => <span style={{ color: "red" }}>No</span>;

const ApiHealthWidget = () => {
    const { data: apiHealth } = useSystemHealthQuery();

    return (
        <DashboardWidget title="API health">
            {apiHealth && (
                <>
                    <dl>
                        <dt>Response</dt>
                        <dd style={{ color: "green" }}>Ok</dd>

                        <dt>Attachments directory is writeable</dt>
                        <dd>{apiHealth.attachmentsDirectory.writeable ? <GreenYes /> : <RedNo />}</dd>
                    </dl>
                </>
            )}
        </DashboardWidget>
    );
};

export default ApiHealthWidget;
