import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/PrimaryButton";

const AzureDevopsForm = ({ integration, integrationSetter: setIntegration, onFormSubmit }: any) => {
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
                <legend>{t("Azure DevOps integration information")}</legend>

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
                    label={t("Organization URL")}
                    htmlFor="url"
                    control={
                        <NativeInput
                            id="url"
                            type="url"
                            name="url"
                            value={integration.url || ""}
                            onChange={onFormChange}
                            required
                            placeholder="https://dev.azure.com/your-organization"
                        />
                    }
                />
                <FormField
                    label={t("Project name")}
                    htmlFor="projectName"
                    control={
                        <NativeInput
                            id="projectName"
                            type="text"
                            name="projectName"
                            value={integration.projectName || ""}
                            onChange={onFormChange}
                            required
                            placeholder="Your project name"
                        />
                    }
                />
                <FormField
                    label={t("Personal Access Token")}
                    htmlFor="personalAccessToken"
                    control={
                        <NativeInput
                            id="personalAccessToken"
                            type="password"
                            name="personalAccessToken"
                            value={integration.personalAccessToken || ""}
                            onChange={onFormChange}
                            required
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

            <FormActions>
                <PrimaryButton type="submit">{t("Save")}</PrimaryButton>
            </FormActions>
        </Form>
    );
};

export default AzureDevopsForm;
