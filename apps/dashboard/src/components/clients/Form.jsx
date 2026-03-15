import { requestAttachment } from "api/requests/attachments.js";
import LabelledField from "components/form/LabelledField";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import RestrictedComponent from "components/logic/RestrictedComponent";
import OrganisationTypes from "models/OrganisationTypes.js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../ui/buttons/Primary";

const ClientForm = ({ isEditForm = false, onFormSubmit, client, clientSetter: setClient }) => {
    const [t] = useTranslation();

    const [logo, setLogo] = useState(null);
    const [smallLogo, setSmallLogo] = useState(null);

    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value;

        setClient({ ...client, [name]: value });
    };

    useEffect(() => {
        if (client.small_logo_attachment_id) {
            downloadAndDisplayLogo(client.small_logo_attachment_id, "small_logo");
        }

        if (client.logo_attachment_id) {
            downloadAndDisplayLogo(client.logo_attachment_id, "logo");
        }
    }, [client]);

    const downloadAndDisplayLogo = (logoId, type) => {
        requestAttachment(logoId).then(({ blob }) => {
            const url = URL.createObjectURL(blob);
            if (type === "small_logo") {
                setSmallLogo(url);
            } else {
                setLogo(url);
            }
        });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <LabelledField
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

                <LabelledField
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

                <LabelledField
                    label={t("Address")}
                    control={
                        <NativeInput type="text" name="address" value={client.address || ""} onChange={onFormChange} />
                    }
                />

                <label>
                    URL
                    <NativeInput type="text" name="url" value={client.url || ""} onChange={onFormChange} />
                </label>
            </fieldset>

            <fieldset>
                <legend>Branding</legend>

                <label>
                    Default logo
                    <div>
                        {logo && <img src={logo} alt="The main logo of client" />}
                        <RestrictedComponent
                            roles={["administrator", "superuser", "user"]}
                            message="(access restricted)"
                        >
                            <input type="file" name="logo" accept="image/*" />
                        </RestrictedComponent>
                    </div>
                </label>

                <label>
                    Small Logo
                    <div>
                        {smallLogo && <img src={smallLogo} alt="The smaller version of the logo" />}
                        <RestrictedComponent
                            roles={["administrator", "superuser", "user"]}
                            message="(access restricted)"
                        >
                            <input type="file" name="smallLogo" accept="image/*" />
                        </RestrictedComponent>
                    </div>
                </label>

                <PrimaryButton type="submit">{isEditForm ? "Save" : "Add"}</PrimaryButton>
            </fieldset>
        </form>
    );
};

export default ClientForm;
