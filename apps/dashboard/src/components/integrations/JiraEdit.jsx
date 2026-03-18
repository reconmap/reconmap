import { useJiraIntegrationQuery, useUpdateJiraIntegrationMutation } from "api/jira.ts";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import JiraForm from "./JiraForm";

const JiraIntegrationEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { integrationId } = useParams();
    const [integration, setIntegration] = useState({});

    const { data: dbIntegration, isLoading } = useJiraIntegrationQuery(parseInt(integrationId));
    const updateMutation = useUpdateJiraIntegrationMutation();

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
