import { useDeleteOrganisationMutation, useOrganisationsQuery } from "api/clients.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import Loading from "components/ui/Loading.jsx";
import Title from "components/ui/Title";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ExportButton from "components/ui/buttons/ExportButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import OrganisationTypes from "models/OrganisationTypes.js";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../ui/Breadcrumb";
import ExternalLink from "../ui/ExternalLink";
import LinkButton from "../ui/buttons/Link";
import ClientLink from "./Link";
import OrganisationsUrls from "./OrganisationsUrls";

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
