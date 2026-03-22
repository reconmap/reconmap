import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import LabelledField from "components/form/LabelledField";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/Primary.jsx";

const AzureDevopsForm = ({ isEdit = false, integration, integrationSetter: setIntegration, onFormSubmit }) => {
    const [t] = useTranslation();

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setIntegration({ ...integration, [name]: value });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>{t("Azure DevOps integration information")}</legend>

                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
                    label={t("Enabled?")}
                    control={
                        <NativeCheckbox name="isEnabled" checked={integration.isEnabled} onChange={onFormChange}>
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

export default AzureDevopsForm;
