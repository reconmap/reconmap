import { useDeleteWebhookMutation, useWebhooksQuery } from "api/webhooks.js";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import BooleanText from "components/ui/BooleanText";
import Breadcrumb from "components/ui/Breadcrumb.jsx";
import CreateButton from "components/ui/buttons/Create.jsx";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link.jsx";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import Title from "components/ui/Title";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const WebhooksList = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { data: webhooks, isLoading } = useWebhooksQuery();
    const deleteWebhookMutation = useDeleteWebhookMutation();

    const handleCreate = () => {
        navigate("/integrations/webhooks/create");
    };

    const onDeleteClick = (webhookId) => {
        if (window.confirm(t("Are you sure you want to delete this webhook?"))) {
            deleteWebhookMutation.mutate(webhookId);
        }
    };

    const columns = [
        {
            header: t("Name"),
            cell: (webhook) => webhook.name,
        },
        {
            header: t("URL"),
            cell: (webhook) => webhook.url,
        },
        {
            header: t("Events"),
            cell: (webhook) => webhook.events,
        },
        {
            header: t("Enabled?"),
            cell: (webhook) => <BooleanText value={webhook.isEnabled} />,
        },
        {
            header: <>&nbsp;</>,
            cell: (webhook) => (
                <div style={{ textAlign: "right" }}>
                    <LinkButton href={`/integrations/webhooks/${webhook.id}/edit`}>{t("Edit")}</LinkButton>
                    <DeleteIconButton onClick={() => onDeleteClick(webhook.id)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <NativeButtonGroup>
                    <CreateButton onClick={handleCreate}>{t("Create webhook")}</CreateButton>
                </NativeButtonGroup>
            </div>
            <Title title={t("Webhooks")} />

            <NativeTable
                columns={columns}
                rows={isLoading ? null : webhooks}
                rowId={(webhook) => webhook.id}
                emptyRowsMessage={t("No webhooks available.")}
            ></NativeTable>
        </>
    );
};

export default WebhooksList;
