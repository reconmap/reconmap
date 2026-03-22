import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import LabelledField from "components/form/LabelledField";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/Primary.jsx";

const WebhookForm = ({ isEdit = false, webhook, webhookSetter: setWebhook, onFormSubmit }) => {
    const [t] = useTranslation();

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setWebhook({ ...webhook, [name]: value });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>{t("Webhook information")}</legend>

                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
                    label={t("Enabled?")}
                    control={
                        <NativeCheckbox name="isEnabled" checked={webhook.isEnabled} onChange={onFormChange}>
                            {t("Is enabled")}
                        </NativeCheckbox>
                    }
                />
            </fieldset>

            <LabelledField
                label=""
                control={
                    <div className="control">
                        <PrimaryButton type="submit">{isEdit ? t("Update") : t("Create")}</PrimaryButton>
                    </div>
                }
            />
        </form>
    );
};

export default WebhookForm;
