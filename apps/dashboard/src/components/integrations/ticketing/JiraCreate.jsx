import { useCreateJiraIntegrationMutation } from "api/jira.ts";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import JiraForm from "./JiraForm";

const JiraIntegrationCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [integration, setIntegration] = useState({ isEnabled: true });

    const createMutation = useCreateJiraIntegrationMutation();

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
                    <div>{t("Jira")}</div>
                </Breadcrumb>
            </div>
            <Title title={t("Create Jira integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <JiraForm integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default JiraIntegrationCreatePage;
