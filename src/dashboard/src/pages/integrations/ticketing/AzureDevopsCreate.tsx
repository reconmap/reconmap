import { useCreateAzureDevopsIntegrationMutation } from "api/azure-devops";
import AzureDevopsForm from "components/integrations/ticketing/AzureDevopsForm";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

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
                    <Link to="/integrations">{t("Integrations")}</Link>
                    <div>{t("Azure DevOps")}</div>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("Create Azure DevOps integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <AzureDevopsForm integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AzureDevopsIntegrationCreatePage;
