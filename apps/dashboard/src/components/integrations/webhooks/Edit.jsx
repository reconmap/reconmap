import { requestWebhookPut } from "api/requests/webhooks.ts";
import { useWebhookQuery } from "api/webhooks.ts";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../ui/Breadcrumb.jsx";
import WebhookForm from "./Form.jsx";

const WebhookEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { webhookId } = useParams();
    const { data: webhookData, isLoading } = useWebhookQuery(parseInt(webhookId));
    const [webhook, setWebhook] = useState(null);

    useEffect(() => {
        if (webhookData) {
            setWebhook(webhookData);
        }
    }, [webhookData]);

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
            <Title title={t("Edit webhook")} />
            <WebhookForm
                isEdit={true}
                webhook={webhook}
                webhookSetter={setWebhook}
                onFormSubmit={onFormSubmit}
            />
        </>
    );
};

export default WebhookEditPage;
