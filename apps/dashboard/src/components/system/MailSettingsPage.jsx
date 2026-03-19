import { useSystemMailSettingsQuery, useSystemMailSettingsUpdateMutation } from "api/system.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField";
import NativeInput from "components/form/NativeInput";
import PrimaryButton from "components/ui/buttons/Primary";
import Title from "components/ui/Title";
import { actionCompletedToast, errorToast } from "components/ui/toast.jsx";
import Loading from "components/ui/Loading";
import { useEffect, useState } from "react";
import Breadcrumb from "../ui/Breadcrumb";

const defaultFormState = {
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    clearSmtpPassword: false,
    smtpFromEmail: "",
    smtpFromName: "",
    smtpUseSsl: true,
    imapHost: "",
    imapPort: "993",
    imapUsername: "",
    imapPassword: "",
    clearImapPassword: false,
    imapUseSsl: true,
};

const MailSettingsPage = () => {
    const { data, isLoading } = useSystemMailSettingsQuery();
    const updateMutation = useSystemMailSettingsUpdateMutation();
    const [formState, setFormState] = useState(defaultFormState);

    useEffect(() => {
        if (!data) {
            return;
        }

        setFormState({
            smtpHost: data.smtpHost ?? "",
            smtpPort: String(data.smtpPort ?? 587),
            smtpUsername: data.smtpUsername ?? "",
            smtpPassword: "",
            clearSmtpPassword: false,
            smtpFromEmail: data.smtpFromEmail ?? "",
            smtpFromName: data.smtpFromName ?? "",
            smtpUseSsl: data.smtpUseSsl ?? true,
            imapHost: data.imapHost ?? "",
            imapPort: String(data.imapPort ?? 993),
            imapUsername: data.imapUsername ?? "",
            imapPassword: "",
            clearImapPassword: false,
            imapUseSsl: data.imapUseSsl ?? true,
        });
    }, [data]);

    const updateField = (ev) => {
        const { name, type, checked, value } = ev.target;
        setFormState((currentState) => ({
            ...currentState,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const payload = {
            smtpHost: formState.smtpHost,
            smtpPort: formState.smtpPort === "" ? null : Number(formState.smtpPort),
            smtpUsername: formState.smtpUsername,
            smtpPassword: formState.smtpPassword,
            clearSmtpPassword: formState.clearSmtpPassword,
            smtpFromEmail: formState.smtpFromEmail,
            smtpFromName: formState.smtpFromName,
            smtpUseSsl: formState.smtpUseSsl,
            imapHost: formState.imapHost,
            imapPort: formState.imapPort === "" ? null : Number(formState.imapPort),
            imapUsername: formState.imapUsername,
            imapPassword: formState.imapPassword,
            clearImapPassword: formState.clearImapPassword,
            imapUseSsl: formState.imapUseSsl,
        };

        updateMutation
            .mutateAsync(payload)
            .then(() => {
                actionCompletedToast("Mail settings saved");
                setFormState((currentState) => ({
                    ...currentState,
                    smtpPassword: "",
                    clearSmtpPassword: false,
                    imapPassword: "",
                    clearImapPassword: false,
                }));
            })
            .catch((error) => {
                errorToast(error.message ?? "Unable to save mail settings");
            });
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <div>System</div>
                </Breadcrumb>
            </div>

            <Title title="Mail settings" />

            <form onSubmit={handleSubmit}>
                <h2 className="title is-5">SMTP</h2>

                <HorizontalLabelledField
                    label="Host"
                    control={<NativeInput type="text" name="smtpHost" value={formState.smtpHost} onChange={updateField} />}
                />

                <HorizontalLabelledField
                    label="Port"
                    control={
                        <NativeInput
                            type="number"
                            min="1"
                            name="smtpPort"
                            value={formState.smtpPort}
                            onChange={updateField}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Username"
                    control={
                        <NativeInput type="text" name="smtpUsername" value={formState.smtpUsername} onChange={updateField} />
                    }
                />

                <HorizontalLabelledField
                    label="Password"
                    control={
                        <NativeInput
                            type="password"
                            name="smtpPassword"
                            value={formState.smtpPassword}
                            onChange={updateField}
                            placeholder={data?.hasSmtpPassword ? "Leave blank to keep the stored password" : ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label=""
                    control={
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                name="clearSmtpPassword"
                                checked={formState.clearSmtpPassword}
                                onChange={updateField}
                            />{" "}
                            Clear stored SMTP password
                        </label>
                    }
                />

                <HorizontalLabelledField
                    label="Sender email"
                    control={
                        <NativeInput type="email" name="smtpFromEmail" value={formState.smtpFromEmail} onChange={updateField} />
                    }
                />

                <HorizontalLabelledField
                    label="Sender name"
                    control={
                        <NativeInput type="text" name="smtpFromName" value={formState.smtpFromName} onChange={updateField} />
                    }
                />

                <HorizontalLabelledField
                    label=""
                    control={
                        <label className="checkbox">
                            <input type="checkbox" name="smtpUseSsl" checked={formState.smtpUseSsl} onChange={updateField} /> Use
                            SSL/TLS
                        </label>
                    }
                />

                <hr />

                <h2 className="title is-5">IMAP</h2>

                <HorizontalLabelledField
                    label="Host"
                    control={<NativeInput type="text" name="imapHost" value={formState.imapHost} onChange={updateField} />}
                />

                <HorizontalLabelledField
                    label="Port"
                    control={
                        <NativeInput
                            type="number"
                            min="1"
                            name="imapPort"
                            value={formState.imapPort}
                            onChange={updateField}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Username"
                    control={
                        <NativeInput type="text" name="imapUsername" value={formState.imapUsername} onChange={updateField} />
                    }
                />

                <HorizontalLabelledField
                    label="Password"
                    control={
                        <NativeInput
                            type="password"
                            name="imapPassword"
                            value={formState.imapPassword}
                            onChange={updateField}
                            placeholder={data?.hasImapPassword ? "Leave blank to keep the stored password" : ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label=""
                    control={
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                name="clearImapPassword"
                                checked={formState.clearImapPassword}
                                onChange={updateField}
                            />{" "}
                            Clear stored IMAP password
                        </label>
                    }
                />

                <HorizontalLabelledField
                    label=""
                    control={
                        <label className="checkbox">
                            <input type="checkbox" name="imapUseSsl" checked={formState.imapUseSsl} onChange={updateField} /> Use
                            SSL/TLS
                        </label>
                    }
                />

                <hr />

                <HorizontalLabelledField control={<PrimaryButton type="submit">Save</PrimaryButton>} />
            </form>
        </div>
    );
};

export default MailSettingsPage;
