import { useAzureDevopsIntegrationQuery, useUpdateAzureDevopsIntegrationMutation } from "api/azure-devops.ts";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AzureDevopsForm from "./AzureDevopsForm";

const AzureDevopsIntegrationEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { integrationId } = useParams();
    const [integration, setIntegration] = useState({});

    const { data: dbIntegration, isLoading } = useAzureDevopsIntegrationQuery(parseInt(integrationId));
    const updateMutation = useUpdateAzureDevopsIntegrationMutation();

    useEffect(() => {
        if (dbIntegration) {
            setIntegration(dbIntegration);
        }
    }, [dbIntegration]);

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        updateMutation.mutate({ id: parseInt(integrationId), data: integration }, {
            onSuccess: () => {
                navigate("/integrations");
            },
        });
    };

    if (isLoading) return <div>{t("Loading...")}</div>;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div onClick={() => navigate("/integrations")}>{t("Integrations")}</div>
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
