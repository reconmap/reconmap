import ExternalLink from "components/ui/ExternalLink";
import DashboardWidget from "./Widget";

const WelcomeWidget = () => {
    return (
        <DashboardWidget title="Welcome!">
            <p>
                To configure this dashboard switch to the "Configure" tab and select the widgets you want to see every
                time you log in.
            </p>
            <p>Each user will have a different set of widgets so pick the ones you find most useful.</p>
            <br />
            <p>
                Please star our repo and send us feedback here:{" "}
                <ExternalLink href="https://github.com/reconmap/reconmap">
                    https://github.com/reconmap/reconmap
                </ExternalLink>
            </p>
        </DashboardWidget>
    );
};

export default WelcomeWidget;
