import { useConfirm } from "components/ui/useConfirm";
import { useDeleteOrganisationMutation, useOrganisationsQuery } from "api/clients";
import ClientLink from "components/clients/ClientLink";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import Breadcrumb from "components/ui/Breadcrumb";
import ExternalLink from "components/ui/ExternalLink";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteButton from "components/ui/buttons/DeleteButton";
import ExportButton from "components/ui/buttons/ExportButton";
import LinkButton from "components/ui/buttons/LinkButton";
import NativeTable from "components/ui/tables/NativeTable";
import OrganisationTypes from "models/OrganisationTypes";
import { useTranslation } from "react-i18next";
import { ClientsUrls } from "AppUrls";

const ClientsListPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();

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
                    <DeleteButton display="icon"
                        onClick={async () => {
                            if (await confirm(t("Are you sure you want to delete this client?"))) {
                                deleteOrganisationMutation.mutate(org.id);
                            }
                        }}
                    />
                </>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />

                <NativeButtonGroup>
                    <ExportButton
                        entity="organisations"
                        disabled={!organisations?.length}
                    />
                    <LinkButton className="button is-primary" href={ClientsUrls.Create}>{t("New organisation")}</LinkButton>
                </NativeButtonGroup>
            </div>
            <PageTitleHeader title={t("Organisations")} />

            <NativeTable columns={columns} rows={isLoading ? null : organisations} rowId={(org) => org.id}></NativeTable>
            {confirmDialog}
        </>
    );
};

export default ClientsListPage;
