import { requestWebhookPost } from "api/requests/webhooks";
import WebhookForm from "components/integrations/webhooks/WebhookForm";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const WebhookCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [webhook, setWebhook] = useState({ isEnabled: true });

    const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        requestWebhookPost(webhook)
            .then(() => {
                toast.success(t("The webhook was created."));
                navigate("/integrations/webhooks");
            })
            .catch((err) => console.error(err));
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>
            <PageTitleHeader title={t("New webhook")} />
            <WebhookForm
                webhook={webhook}
                webhookSetter={setWebhook}
                onFormSubmit={onFormSubmit}
            />
        </>
    );
};

export default WebhookCreatePage;
