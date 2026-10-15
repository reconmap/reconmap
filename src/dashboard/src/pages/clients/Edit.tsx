import { useOrganisationQuery, useOrganisationsQueriesInvalidation } from "api/clients";
import { requestOrganisationPut } from "api/requests/organisations";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import ClientForm from "components/clients/Form";

const EditClientPage = () => {
    const navigate = useNavigate();
    const { clientId } = useParams() as any;

    const { data: serverClient, isLoading } = useOrganisationQuery(clientId);
    const [clientClient, setClientClient] = useState<any>(null);
    const organisationsQueryInvalidation = useOrganisationsQueriesInvalidation();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestOrganisationPut(clientId, clientClient).then(() => {
            actionCompletedToast(`The client "${clientClient.name}" has been updated.`);
            organisationsQueryInvalidation();
            navigate(`/organisations/${clientId}`);
        });
    };

    useEffect(() => {
        if (!isLoading) setClientClient(serverClient);
    }, [isLoading, serverClient]);

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/clients">Clients</Link>
                </Breadcrumb>
            </div>

            <Title title="Client details" />

            {!clientClient ? (
                <Loading />
            ) : (
                <ClientForm
                    isEditForm={true}
                    onFormSubmit={onFormSubmit}
                    client={clientClient}
                    clientSetter={setClientClient}
                />
            )}
        </div>
    );
};

export default EditClientPage;
