import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import OrganisationsUrls from "./OrganisationsUrls";

const styles = {
    badge: {
        alignItems: "center",
        display: `inline-flex`,
        fontSize: "var(--fontSizeSmall)",
    },
};

const ClientLink = ({ clientId, children }) => {
    const [t] = useTranslation();

    if (!clientId) {
        return t("(not set)");
    }

    return (
        <Link style={styles.badge} to={OrganisationsUrls.Details.replace(":organisationId", clientId)}>
            {children}
        </Link>
    );
};

export default ClientLink;
