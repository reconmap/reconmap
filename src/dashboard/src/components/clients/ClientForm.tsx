import { requestAttachment } from "api/requests/attachments";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import RestrictedComponent from "components/logic/RestrictedComponent";
import OrganisationTypes from "models/OrganisationTypes";
import { ignoreAbortError } from "utilities/abort";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../ui/buttons/PrimaryButton";

const ClientForm = ({ onFormSubmit, client, clientSetter: setClient }: any) => {
    const [t] = useTranslation();

    const [logo, setLogo] = useState<any>(null);
    const [smallLogo, setSmallLogo] = useState<any>(null);

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value;

        setClient({ ...client, [name]: value });
    };

    const downloadAndDisplayLogo = (logoId, type, signal: AbortSignal, objectUrls: string[]) => {
        requestAttachment(logoId, { signal })
            .then(({ blob }) => {
                const url = URL.createObjectURL(blob);
                objectUrls.push(url);
                if (type === "small_logo") {
                    setSmallLogo(url);
                } else {
                    setLogo(url);
                }
            })
            .catch(ignoreAbortError);
    };

    useEffect(() => {
        const controller = new AbortController();
        const objectUrls: string[] = [];

        if (client.small_logo_attachment_id) {
            downloadAndDisplayLogo(client.small_logo_attachment_id, "small_logo", controller.signal, objectUrls);
        }

        if (client.logo_attachment_id) {
            downloadAndDisplayLogo(client.logo_attachment_id, "logo", controller.signal, objectUrls);
        }

        return () => {
            controller.abort();
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [client]);

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <FormField
                    label={t("Type")}
                    control={
                        <NativeSelect name="kind" value={client.kind} onChange={onFormChange}>
                            {Object.entries(OrganisationTypes).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {t(v)}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />

                <FormField
                    label={t("Name")}
                    control={
                        <NativeInput
                            type="text"
                            name="name"
                            value={client.name || ""}
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />

                <FormField
                    label={t("Address")}
                    control={
                        <NativeInput type="text" name="address" value={client.address || ""} onChange={onFormChange} />
                    }
                />

                <FormField
                    htmlFor="clientUrl"
                    label="URL"
                    control={
                        <NativeInput
                            id="clientUrl"
                            type="text"
                            name="url"
                            value={client.url || ""}
                            onChange={onFormChange}
                        />
                    }
                />
            </fieldset>

            <fieldset>
                <legend>Branding</legend>

                <FormField
                    htmlFor="clientLogo"
                    label="Default logo"
                    control={
                        <div>
                            {logo && <img src={logo} alt="The main logo of client" />}
                            <RestrictedComponent
                                roles={["administrator", "superuser", "user"]}
                                message="(access restricted)"
                            >
                                <input id="clientLogo" type="file" name="logo" accept="image/*" />
                            </RestrictedComponent>
                        </div>
                    }
                />

                <FormField
                    htmlFor="clientSmallLogo"
                    label="Small Logo"
                    control={
                        <div>
                            {smallLogo && <img src={smallLogo} alt="The smaller version of the logo" />}
                            <RestrictedComponent
                                roles={["administrator", "superuser", "user"]}
                                message="(access restricted)"
                            >
                                <input id="clientSmallLogo" type="file" name="smallLogo" accept="image/*" />
                            </RestrictedComponent>
                        </div>
                    }
                />

            </fieldset>

            <FormActions>
                <PrimaryButton type="submit">Save</PrimaryButton>
            </FormActions>
        </Form>
    );
};

export default ClientForm;
