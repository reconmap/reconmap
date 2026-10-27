import { useQueryClient } from "@tanstack/react-query";
import { requestOrganisationPost } from "api/requests/organisations";
import ClientForm from "components/clients/ClientForm";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import { HttpStatus } from "utilities/httpStatus";
import Client from "models/Client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { ClientsUrls } from "AppUrls";

const ClientCreatePage = () => {
    const [t] = useTranslation();

    const navigate = useNavigate();
    const [newClient, setNewClient] = useState(Client);
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        const form = ev.target.closest("form");
        const formData = new FormData(form);

        requestOrganisationPost(formData).then((resp) => {
            if (resp.status === HttpStatus.CREATED) {
                queryClient.invalidateQueries({ queryKey: ["organisations"] });
                toast.success(`The client "${newClient.name}" has been added.`);
                navigate(ClientsUrls.List);
            } else {
                toast.error("The client could not be saved. Review the form data or check the application logs.");
            }
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to={ClientsUrls.List}>{t("Organisations")}</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("New organisation")} />

            <ClientForm onFormSubmit={onFormSubmit} client={newClient} clientSetter={setNewClient} />
        </div>
    );
};

export default ClientCreatePage;
