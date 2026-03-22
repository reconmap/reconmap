import { useDeleteOrganisationMutation, useOrganisationsQuery } from "api/clients.js";
import ClientLink from "components/clients/Link";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb";
import ExternalLink from "components/ui/ExternalLink";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ExportButton from "components/ui/buttons/ExportButton";
import LinkButton from "components/ui/buttons/Link";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import OrganisationTypes from "models/OrganisationTypes.js";
import { useTranslation } from "react-i18next";
import OrganisationsUrls from "./Urls.js";

const ClientsList = () => {
    const [t] = useTranslation();

    const { data: organisations, isLoading, isError, error } = useOrganisationsQuery({});
    const deleteOrganisationMutation = useDeleteOrganisationMutation();

    if (isLoading) return <Loading />;

    if (isError)
        return (
            <div>
                {t("An error occurred while fetching the organisations.")} {error.message}
            </div>
        );

    const columns = [
        {
            header: t("Type"),
            cell: (org) => OrganisationTypes[org.kind],
        },
        {
            header: t("Name"),
            cell: (org) => <ClientLink clientId={org.id}>{org.name}</ClientLink>,
        },
        {
            header: t("Address"),
            cell: (org) =>
                org.address || "-"
            ,
        },
        {
            header: t("URL"),
            cell: (org) => (org.url ? <ExternalLink href={org.url}>{org.url}</ExternalLink> : "-"),
        },
        {
            header: <>&nbsp;</>,
            cell: (org) => (
                <>
                    {" "}
                    <LinkButton href={OrganisationsUrls.Edit.replace(":organisationId", org.id)}>
                        {t("Edit")}
                    </LinkButton>
                    <DeleteIconButton onClick={() => deleteOrganisationMutation.mutate(org.id)} />
                </>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />

                <NativeButtonGroup>
                    <LinkButton href={OrganisationsUrls.Create}>{t("Add organisation")}</LinkButton>
                    <ExportButton
                        entity="organisations"
                        disabled={organisations === null || organisations?.length === 0}
                    />
                </NativeButtonGroup>
            </div>
            <Title title={t("Organisations")} />

            <NativeTable columns={columns} rows={organisations} rowId={(org) => org.id}></NativeTable>
        </>
    );
};

export default ClientsList;
