import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import LabelledField from "components/form/LabelledField";
import NativeCheckbox from "components/form/NativeCheckbox";
import NativeInput from "components/form/NativeInput";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/Primary.jsx";

const JiraForm = ({ isEdit = false, integration, integrationSetter: setIntegration, onFormSubmit }) => {
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
                <legend>{t("Jira integration information")}</legend>

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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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
                <HorizontalLabelledField
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

export default JiraForm;
