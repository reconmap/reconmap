import { useSystemIntegrationsQuery } from "api/system.js";
import ExternalLink from "components/ui/ExternalLink";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import Title from "components/ui/Title";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../ui/Breadcrumb";

const SystemIntegrationsPage = () => {
    const { data: integrations, isLoading } = useSystemIntegrationsQuery();
    const [t] = useTranslation();

    const columns = [
        {
            header: t("Name"),
            cell: (integration) => integration.name,
        },
        {
            header: t("Description"),
            cell: (integration) => integration.description,
        },
        {
            header: t("External URL"),
            cell: (integration) => (
                <ExternalLink href={integration.externalUrl}>{integration.externalUrl}</ExternalLink>
            ),
        },
        {
            header: t("Configured?"),
            cell: (integration) => (integration.configured ? t("Yes") : t("No")),
        },
    ];

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
            </div>
            <Title title="Integrations" />

            <NativeTable
                columns={columns}
                rows={integrations}
                rowId={(_, index) => index}
                isLoading={isLoading}
            ></NativeTable>
        </div>
    );
};

export default SystemIntegrationsPage;
