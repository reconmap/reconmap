import { useDeleteWebhookMutation, useWebhooksQuery } from "api/webhooks";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import BooleanText from "components/ui/BooleanText";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useConfirm } from "components/ui/useConfirm";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const WebhooksListPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();
    const { data: webhooks, isLoading } = useWebhooksQuery();
    const deleteWebhookMutation = useDeleteWebhookMutation();

    const handleCreate = () => {
        navigate("/integrations/webhooks/create");
    };

    const onDeleteClick = async (webhookId) => {
        if (await confirm(t("Are you sure you want to delete this webhook?"))) {
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
                    <DeleteButton display="icon" onClick={() => onDeleteClick(webhook.id)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <NativeButtonGroup>
                    <CreateButton onClick={handleCreate}>{t("New webhook")}</CreateButton>
                </NativeButtonGroup>
            </div>
            <PageTitleHeader title={t("Webhooks")} />

            <NativeTable
                columns={columns}
                rows={isLoading ? null : webhooks}
                rowId={(webhook) => webhook.id}
                emptyRowsMessage={t("No webhooks available.")}
            ></NativeTable>
            {confirmDialog}
        </>
    );
};

export default WebhooksListPage;
