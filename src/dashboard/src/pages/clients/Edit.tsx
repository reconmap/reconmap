import { useOrganisationQuery, useOrganisationsQueriesInvalidation } from "api/clients";
import { requestOrganisationPut } from "api/requests/organisations";
import { Link, useNavigate, useParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { actionCompletedToast } from "components/ui/toast";
import ClientForm from "components/clients/Form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const EditClientPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { clientId } = useParams() as any;

    const { data: serverClient } = useOrganisationQuery(clientId);
    const [clientEdits, setClientClient] = useState<any>(null);
    const clientClient = clientEdits ?? serverClient;
    const organisationsQueryInvalidation = useOrganisationsQueriesInvalidation();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestOrganisationPut(clientId, clientClient).then(() => {
            actionCompletedToast(`The client "${clientClient.name}" has been updated.`);
            organisationsQueryInvalidation();
            navigate(`/organisations/${clientId}`);
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/clients">Clients</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("Edit organisation")} />

            {!clientClient ? (
                <Loading />
            ) : (
                <ClientForm
                    onFormSubmit={onFormSubmit}
                    client={clientClient}
                    clientSetter={setClientClient}
                />
            )}
        </div>
    );
};

export default EditClientPage;
