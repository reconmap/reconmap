import { useCreateAzureDevopsIntegrationMutation } from "api/azure-devops.ts";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AzureDevopsForm from "./AzureDevopsForm.jsx";

const AzureDevopsIntegrationCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [integration, setIntegration] = useState({ isEnabled: true });

    const createMutation = useCreateAzureDevopsIntegrationMutation();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        createMutation.mutate(integration, {
            onSuccess: () => {
                navigate("/integrations");
            },
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div onClick={() => navigate("/integrations")}>{t("Integrations")}</div>
                    <div>{t("Azure DevOps")}</div>
                </Breadcrumb>
            </div>
            <Title title={t("Create Azure DevOps integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <AzureDevopsForm integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AzureDevopsIntegrationCreatePage;
