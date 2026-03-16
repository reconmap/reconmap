import { useDeleteWebhookMutation, useWebhooksQuery } from "api/webhooks.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import BooleanText from "components/ui/BooleanText";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import Title from "components/ui/Title";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CreateButton from "../../components/ui/buttons/Create";
import Breadcrumb from "../ui/Breadcrumb";
import LinkButton from "../ui/buttons/Link";

const WebhooksList = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { data: webhooks, isLoading } = useWebhooksQuery();
    const deleteWebhookMutation = useDeleteWebhookMutation();

    const handleCreate = () => {
        navigate("/webhooks/create");
    };

    const onDeleteClick = (webhookId) => {
        if (window.confirm(t("Are you sure you want to delete this webhook?"))) {
            deleteWebhookMutation.mutate(webhookId);
        }
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <NativeButtonGroup>
                    <CreateButton onClick={handleCreate}>{t("Create webhook")}</CreateButton>
                </NativeButtonGroup>
            </div>
            <Title title={t("Webhooks")} />
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
                    {isLoading ? (
                        <LoadingTableRow numColumns={5} />
                    ) : (
                        <>
                            {null !== webhooks && 0 === webhooks.length && <NoResultsTableRow numColumns={5} />}
                            {null !== webhooks &&
                                0 !== webhooks.length &&
                                webhooks.map((webhook, index) => (
                                    <tr key={index}>
                                        <td>{webhook.name}</td>
                                        <td>{webhook.url}</td>
                                        <td>{webhook.events}</td>
                                        <td>
                                            <BooleanText value={webhook.isEnabled} />
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <LinkButton href={`/webhooks/${webhook.id}/edit`}>{t("Edit")}</LinkButton>
                                            <DeleteIconButton
                                                onClick={() => onDeleteClick(webhook.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                        </>
                    )}
                </tbody>
            </table>
        </>
    );
};

export default WebhooksList;
