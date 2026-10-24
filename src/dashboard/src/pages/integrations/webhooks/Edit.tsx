import { requestWebhookPut } from "api/requests/webhooks";
import { useWebhookQuery } from "api/webhooks";
import WebhookForm from "components/integrations/webhooks/Form";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { actionCompletedToast } from "components/ui/toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

const WebhookEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { webhookId } = useParams() as any;
    const { data: webhookData, isLoading } = useWebhookQuery(parseInt(webhookId));
    const [webhookEdits, setWebhook] = useState<any>(null);
    const webhook = webhookEdits ?? webhookData;

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestWebhookPut(parseInt(webhookId), webhook)
            .then(() => {
                actionCompletedToast(t("The webhook was updated."));
                navigate("/integrations/webhooks");
            })
            .catch((err) => console.error(err));
    };

    if (isLoading || !webhook) {
        return <p>{t("Loading...")}</p>;
    }

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>
            <PageTitleHeader title={t("Edit webhook")} />
            <WebhookForm
                webhook={webhook}
                webhookSetter={setWebhook}
                onFormSubmit={onFormSubmit}
            />
        </>
    );
};

export default WebhookEditPage;
