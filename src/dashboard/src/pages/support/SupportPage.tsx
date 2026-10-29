import Configuration from "Configuration";
import { ServerIssuesUrl } from "ServerUrls";
import NativeTextArea from "components/forms/NativeTextArea";
import ExternalLink from "components/ui/ExternalLink";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import { toast } from "components/ui/toast";
import { AuthContext } from "contexts/AuthContext";
import { useContext, type MouseEvent } from "react";

const SupportPage = () => {
    const { user } = useContext(AuthContext);

    const systemInfo = `User
----
ID: ${user.id}
Name: ${user.fullName}
Role: ${user.role}

Client
------
URL: ${document.location.protocol + "//" + document.location.host}
User agent: ${navigator.userAgent}
Build: ${import.meta.env.VITE_GIT_COMMIT_HASH}

Server
------
API URL: ${Configuration.getDefaultApiUrl()}
Notifications URL: ${Configuration.getNotificationsServiceUrl()}
Keycloak URL: ${Configuration.getKeycloakConfig().url}

`;

    const onCopyToClipboardClick = (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();

        navigator.clipboard
            .writeText(systemInfo)
            .then(() => {
                toast.success("Support info copied to the clipboard");
            })
            .catch((err) => {
                toast.error(err);
            });
    };

    return (
        <div className="content">
            <h2>Support information</h2>

            <p>
                If there is something wrong with the app you can report it{" "}
                <ExternalLink href={ServerIssuesUrl}>here</ExternalLink>. Include the information below in the ticket if
                possible as this could accelerate its resolution.
            </p>

            <NativeTextArea id="systemInfoControl" value={systemInfo} readOnly className="textarea is-info" rows="10" />
            <PrimaryButton onClick={onCopyToClipboardClick}>Copy to clipboard</PrimaryButton>
        </div>
    );
};

export default SupportPage;
