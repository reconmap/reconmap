import { useJiraIntegrationQuery, useUpdateJiraIntegrationMutation } from "api/jira";
import JiraForm from "components/integrations/ticketing/JiraForm";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router";

const JiraIntegrationEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { integrationId } = useParams() as any;

    const { data: dbIntegration, isLoading } = useJiraIntegrationQuery(parseInt(integrationId));
    const [integrationEdits, setIntegration] = useState<any>(null);
    const integration = integrationEdits ?? dbIntegration;
    const updateMutation = useUpdateJiraIntegrationMutation();

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
                    <div>{t("Jira")}</div>
                </Breadcrumb>
            </div>
            <Title title={t("Edit Jira integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <JiraForm isEdit={true} integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default JiraIntegrationEditPage;
