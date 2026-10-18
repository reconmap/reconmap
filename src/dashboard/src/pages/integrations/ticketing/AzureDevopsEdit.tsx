import { useAzureDevopsIntegrationQuery, useUpdateAzureDevopsIntegrationMutation } from "api/azure-devops";
import AzureDevopsForm from "components/integrations/ticketing/AzureDevopsForm";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";

const AzureDevopsIntegrationEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { integrationId } = useParams() as any;

    const { data: dbIntegration, isLoading } = useAzureDevopsIntegrationQuery(parseInt(integrationId));
    const [integrationEdits, setIntegration] = useState<any>(null);
    const integration = integrationEdits ?? dbIntegration;
    const updateMutation = useUpdateAzureDevopsIntegrationMutation();

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        updateMutation.mutate({ id: parseInt(integrationId), data: integration }, {
            onSuccess: () => {
                navigate("/integrations");
            },
        });
    };

    if (isLoading || !integration) return <div>{t("Loading...")}</div>;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/integrations">{t("Integrations")}</Link>
                    <div>{t("Azure DevOps")}</div>
                </Breadcrumb>
            </div>
            <Title title={t("Edit Azure DevOps integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <AzureDevopsForm isEdit={true} integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AzureDevopsIntegrationEditPage;
