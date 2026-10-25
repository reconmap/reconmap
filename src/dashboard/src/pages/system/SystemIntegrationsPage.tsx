import { useSystemIntegrationsQuery } from "api/system";
import ExternalLink from "components/ui/ExternalLink";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useTranslation } from "react-i18next";
import Breadcrumb from "components/ui/Breadcrumb";

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
            <PageTitleHeader title={t("Command output parsers")} />

            <NativeTable
                columns={columns}
                rows={integrations}
                rowId={(integration) => integration.name}
                isLoading={isLoading}
            ></NativeTable>
        </div>
    );
};

export default SystemIntegrationsPage;
