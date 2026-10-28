import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/PrimaryButton";

const JiraForm = ({ integration, integrationSetter: setIntegration, onFormSubmit }: any) => {
    const [t] = useTranslation();

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setIntegration({ ...integration, [name]: value });
    };

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>{t("Jira integration information")}</legend>

                <FormField
                    label={t("Name")}
                    htmlFor="name"
                    control={
                        <NativeInput
                            id="name"
                            type="text"
                            name="name"
                            value={integration.name || ""}
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />
                <FormField
                    label={t("Jira URL")}
                    htmlFor="url"
                    control={
                        <NativeInput
                            id="url"
                            type="url"
                            name="url"
                            value={integration.url || ""}
                            onChange={onFormChange}
                            required
                            placeholder="https://your-domain.atlassian.net"
                        />
                    }
                />
                <FormField
                    label={t("Email")}
                    htmlFor="email"
                    control={
                        <NativeInput
                            id="email"
                            type="email"
                            name="email"
                            value={integration.email || ""}
                            onChange={onFormChange}
                            required
                            placeholder="your-email@example.com"
                        />
                    }
                />
                <FormField
                    label={t("API Token")}
                    htmlFor="apiToken"
                    control={
                        <NativeInput
                            id="apiToken"
                            type="password"
                            name="apiToken"
                            value={integration.apiToken || ""}
                            onChange={onFormChange}
                            required
                        />
                    }
                />
                <FormField
                    label={t("Project Key")}
                    htmlFor="projectKey"
                    control={
                        <NativeInput
                            id="projectKey"
                            type="text"
                            name="projectKey"
                            value={integration.projectKey || ""}
                            onChange={onFormChange}
                            required
                            placeholder="PROJ"
                        />
                    }
                />
                <FormField
                    control={
                        <NativeCheckbox name="isEnabled" checked={integration.isEnabled} onChange={onFormChange}>
                            {t("Enabled")}
                        </NativeCheckbox>
                    }
                />
            </fieldset>

            <FormField
                label=""
                control={
                    <div className="control">
                        <PrimaryButton type="submit">{t("Save")}</PrimaryButton>
                    </div>
                }
            />
        </Form>
    );
};

export default JiraForm;
