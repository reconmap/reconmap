import { useOrganisationQuery, useOrganisationsQueriesInvalidation } from "api/clients.js";
import { requestOrganisationPut } from "api/requests/organisations.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import { actionCompletedToast } from "../ui/toast";
import ClientForm from "./Form";

const EditClientPage = () => {
    const navigate = useNavigate();
    const { clientId } = useParams();

    const { data: serverClient, isLoading } = useOrganisationQuery(clientId);
    const [clientClient, setClientClient] = useState(null);
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
