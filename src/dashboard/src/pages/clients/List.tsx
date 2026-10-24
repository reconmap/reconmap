import { useDeleteOrganisationMutation, useOrganisationsQuery } from "api/clients";
import ClientLink from "components/clients/Link";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb";
import ExternalLink from "components/ui/ExternalLink";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ExportButton from "components/ui/buttons/ExportButton";
import LinkButton from "components/ui/buttons/Link";
import NativeTable from "components/ui/tables/NativeTable";
import OrganisationTypes from "models/OrganisationTypes";
import { useTranslation } from "react-i18next";
import { ClientsUrls } from "AppUrls";

const ClientsList = () => {
    const [t] = useTranslation();

    const { data: organisations, isLoading, isError, error } = useOrganisationsQuery({});
    const deleteOrganisationMutation = useDeleteOrganisationMutation();

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
                    <LinkButton href={ClientsUrls.Edit.replace(":organisationId", org.id)}>
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
                    <LinkButton href={ClientsUrls.Create}>{t("Add organisation")}</LinkButton>
                    <ExportButton
                        entity="organisations"
                        disabled={!organisations?.length}
                    />
                </NativeButtonGroup>
            </div>
            <PageTitleHeader title={t("Organisations")} />

            <NativeTable columns={columns} rows={isLoading ? null : organisations} rowId={(org) => org.id}></NativeTable>
        </>
    );
};

export default ClientsList;
