import { useAzureDevopsIntegrationsQuery, useDeleteAzureDevopsIntegrationMutation } from "api/azure-devops";
import { useDeleteJiraIntegrationMutation, useJiraIntegrationsQuery } from "api/jira";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import BooleanText from "components/ui/BooleanText";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/LinkButton";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useConfirm } from "components/ui/useConfirm";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const IntegrationsListPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();

    const { data: jiraIntegrations, isLoading: isJiraLoading } = useJiraIntegrationsQuery();
    const deleteJiraMutation = useDeleteJiraIntegrationMutation();

    const { data: azureDevopsIntegrations, isLoading: isAzureDevopsLoading } = useAzureDevopsIntegrationsQuery();
    const deleteAzureDevopsMutation = useDeleteAzureDevopsIntegrationMutation();

    const onDeleteJira = async (id) => {
        if (await confirm(t("Are you sure you want to delete this Jira integration?"))) {
            deleteJiraMutation.mutate(id);
        }
    };

    const onDeleteAzureDevops = async (id) => {
        if (await confirm(t("Are you sure you want to delete this Azure DevOps integration?"))) {
            deleteAzureDevopsMutation.mutate(id);
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
                        <PageTitleHeader title={t("Jira Integrations")} />
                    </div>
                    <div className="level-right">
                        <NativeButtonGroup>
                            <CreateButton onClick={() => navigate("/integrations/jira/create")}>{t("New Jira integration")}</CreateButton>
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

            <section className="section">
                <div className="level">
                    <div className="level-left">
                        <PageTitleHeader title={t("Azure DevOps Integrations")} />
                    </div>
                    <div className="level-right">
                        <NativeButtonGroup>
                            <CreateButton onClick={() => navigate("/integrations/azure-devops/create")}>{t("New Azure DevOps integration")}</CreateButton>
                        </NativeButtonGroup>
                    </div>
                </div>
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>{t("Name")}</th>
                            <th>{t("URL")}</th>
                            <th>{t("Project Name")}</th>
                            <th>{t("Enabled?")}</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAzureDevopsLoading ? (
                            <LoadingTableRow numColumns={5} />
                        ) : (
                            <>
                                {(!azureDevopsIntegrations || azureDevopsIntegrations.length === 0) && <NoResultsTableRow numColumns={5} />}
                                {azureDevopsIntegrations && azureDevopsIntegrations.map((integration) => (
                                    <tr key={integration.id}>
                                        <td>{integration.name}</td>
                                        <td>{integration.url}</td>
                                        <td>{integration.projectName}</td>
                                        <td><BooleanText value={integration.isEnabled} /></td>
                                        <td style={{ textAlign: "right" }}>
                                            <LinkButton href={`/integrations/azure-devops/${integration.id}/edit`}>{t("Edit")}</LinkButton>
                                            <DeleteIconButton onClick={() => onDeleteAzureDevops(integration.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>
            </section>
            {confirmDialog}
        </>
    );
};

export default IntegrationsListPage;
