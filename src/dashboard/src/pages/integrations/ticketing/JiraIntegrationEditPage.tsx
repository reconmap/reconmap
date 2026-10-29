import { useJiraIntegrationQuery, useUpdateJiraIntegrationMutation } from "api/jira";
import PageSkeleton from "components/ui/PageSkeleton";
import JiraForm from "components/integrations/ticketing/JiraForm";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState, type FormEvent } from "react";
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

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        updateMutation.mutate({ id: parseInt(integrationId), data: integration }, {
            onSuccess: () => {
                navigate("/integrations");
            },
        });
    };

    if (isLoading || !integration) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/integrations">{t("Integrations")}</Link>
                    <div>{t("Jira")}</div>
                </Breadcrumb>
            </div>
            <PageTitleHeader title={t("Edit Jira integration")} />

            <div className="columns">
                <div className="column is-two-thirds">
                    <JiraForm integration={integration} integrationSetter={setIntegration} onFormSubmit={onFormSubmit} />
                </div>
            </div>
        </div>
    );
};

export default JiraIntegrationEditPage;
