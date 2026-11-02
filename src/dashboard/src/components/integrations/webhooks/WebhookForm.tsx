import { type ChangeEvent } from "react";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/PrimaryButton";

const WebhookForm = ({ webhook, webhookSetter: setWebhook, onFormSubmit }: any) => {
    const [t] = useTranslation();

    const onFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
        setWebhook({ ...webhook, [name]: value });
    };

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>{t("Webhook information")}</legend>

                <FormField
                    label={t("Name")}
                    htmlFor="name"
                    control={
                        <NativeInput
                            id="name"
                            type="text"
                            name="name"
                            value={webhook.name || ""}
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />
                <FormField
                    label={t("URL")}
                    htmlFor="url"
                    control={
                        <NativeInput
                            id="url"
                            type="url"
                            name="url"
                            value={webhook.url || ""}
                            onChange={onFormChange}
                            required
                            placeholder="https://example.com/webhook"
                        />
                    }
                />
                <FormField
                    label={t("Secret")}
                    htmlFor="secret"
                    control={
                        <NativeInput
                            id="secret"
                            type="text"
                            name="secret"
                            value={webhook.secret || ""}
                            onChange={onFormChange}
                            placeholder={t("Optional secret for signature")}
                        />
                    }
                />
                <FormField
                    label={t("Events")}
                    htmlFor="events"
                    control={
                        <NativeInput
                            id="events"
                            type="text"
                            name="events"
                            value={webhook.events || ""}
                            onChange={onFormChange}
                            required
                            placeholder="project.created, *"
                        />
                    }
                />
                <FormField
                    control={
                        <NativeCheckbox name="isEnabled" checked={webhook.isEnabled} onChange={onFormChange}>
                            {t("Enabled")}
                        </NativeCheckbox>
                    }
                />
            </fieldset>

            <FormActions>
                <PrimaryButton type="submit">{t("Save")}</PrimaryButton>
            </FormActions>
        </Form>
    );
};

export default WebhookForm;
