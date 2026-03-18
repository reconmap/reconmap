import { useDeleteJiraIntegrationMutation, useJiraIntegrationsQuery } from "api/jira.ts";
import { useDeleteWebhookMutation, useWebhooksQuery } from "api/webhooks.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import BooleanText from "components/ui/BooleanText";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import Breadcrumb from "components/ui/Breadcrumb";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import Title from "components/ui/Title";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const IntegrationsList = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const { data: webhooks, isLoading: isWebhooksLoading } = useWebhooksQuery();
    const deleteWebhookMutation = useDeleteWebhookMutation();

    const { data: jiraIntegrations, isLoading: isJiraLoading } = useJiraIntegrationsQuery();
    const deleteJiraMutation = useDeleteJiraIntegrationMutation();

    const onDeleteWebhook = (id) => {
        if (window.confirm(t("Are you sure you want to delete this webhook?"))) {
            deleteWebhookMutation.mutate(id);
        }
    };

    const onDeleteJira = (id) => {
        if (window.confirm(t("Are you sure you want to delete this Jira integration?"))) {
            deleteJiraMutation.mutate(id);
        }
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>

            <section className="section">
                <div className="level">
                    <div className="level-left">
                        <Title title={t("Webhooks")} />
                    </div>
                    <div className="level-right">
                        <NativeButtonGroup>
                            <CreateButton onClick={() => navigate("/webhooks/create")}>{t("Create webhook")}</CreateButton>
                        </NativeButtonGroup>
                    </div>
                </div>
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>{t("Name")}</th>
                            <th>{t("URL")}</th>
                            <th>{t("Events")}</th>
                            <th>{t("Enabled?")}</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isWebhooksLoading ? (
                            <LoadingTableRow numColumns={5} />
                        ) : (
                            <>
                                {(!webhooks || webhooks.length === 0) && <NoResultsTableRow numColumns={5} />}
                                {webhooks && webhooks.map((webhook) => (
                                    <tr key={webhook.id}>
                                        <td>{webhook.name}</td>
                                        <td>{webhook.url}</td>
                                        <td>{webhook.events}</td>
                                        <td><BooleanText value={webhook.isEnabled} /></td>
                                        <td style={{ textAlign: "right" }}>
                                            <LinkButton href={`/webhooks/${webhook.id}/edit`}>{t("Edit")}</LinkButton>
                                            <DeleteIconButton onClick={() => onDeleteWebhook(webhook.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </section>

            <section className="section">
                <div className="level">
                    <div className="level-left">
                        <Title title={t("Jira Integrations")} />
                    </div>
                    <div className="level-right">
                        <NativeButtonGroup>
                            <CreateButton onClick={() => navigate("/integrations/jira/create")}>{t("Add Jira integration")}</CreateButton>
                        </NativeButtonGroup>
                    </div>
                </div>
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>{t("Name")}</th>
                            <th>{t("URL")}</th>
                            <th>{t("Project Key")}</th>
                            <th>{t("Enabled?")}</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isJiraLoading ? (
                            <LoadingTableRow numColumns={5} />
                        ) : (
                            <>
                                {(!jiraIntegrations || jiraIntegrations.length === 0) && <NoResultsTableRow numColumns={5} />}
                                {jiraIntegrations && jiraIntegrations.map((integration) => (
                                    <tr key={integration.id}>
                                        <td>{integration.name}</td>
                                        <td>{integration.url}</td>
                                        <td>{integration.projectKey}</td>
                                        <td><BooleanText value={integration.isEnabled} /></td>
                                        <td style={{ textAlign: "right" }}>
                                            <LinkButton href={`/integrations/jira/${integration.id}/edit`}>{t("Edit")}</LinkButton>
                                            <DeleteIconButton onClick={() => onDeleteJira(integration.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </section>
        </>
    );
};

export default IntegrationsList;
