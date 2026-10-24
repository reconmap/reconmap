import { useCreateJiraIntegrationMutation } from "api/jira";
import JiraForm from "components/integrations/ticketing/JiraForm";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

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
                    <Link to="/integrations">{t("Integrations")}</Link>
                    <div>{t("Jira")}</div>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("Create Jira integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <JiraForm integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default JiraIntegrationCreatePage;
