import { useState } from "react";
import { defaultPasswordConfiguration, generatePassword } from "services/passwords";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import { useTranslation } from "react-i18next";
import ModalDialog from "components/ui/ModalDialog";
import CssIcon from "components/ui/CssIcon";

// The parent mounts this component only while it is open, so each opening starts with a fresh password.
const PasswordGeneratorModal = ({ onClose, onSelectPassword }: any) => {
    const [t] = useTranslation();
    const [passwordConfig, setPasswordConfig] = useState(defaultPasswordConfiguration);
    const [password, setPassword] = useState(() => {
        try {
            return generatePassword(defaultPasswordConfiguration);
        } catch {
            return "";
        }
    });

    const regeneratePassword = (config) => {
        try {
            setPassword(generatePassword(config));
        } catch {
            // Ignore validation/range errors during typing
        }
    };

    const updatePassword = (ev) => {
        let value = ev.target.value;
        if (
            ["includeUppercase", "includeLowercase", "includeNumbers", "includeSymbols", "avoidAmbiguous"].includes(
                ev.target.name,
            )
        ) {
            value = ev.target.checked;
        }
        const newConfig = { ...passwordConfig, [ev.target.name]: value };
        setPasswordConfig(newConfig);
        regeneratePassword(newConfig);
    };

    const handleGenerate = () => {
        regeneratePassword(passwordConfig);
    };

    const handleSelect = () => {
        onSelectPassword(password);
        onClose();
    };

    return (
        <ModalDialog visible onModalClose={onClose} title={t("Password generator")}>
            <div className="content">
                <FormField layout="vertical"
                    label={t("Password length")}
                    control={
                        <NativeInput
                            name="length"
                            value={passwordConfig.length}
                            type="number"
                            min="5"
                            max="128"
                            onChange={updatePassword}
                        />
                    }
                />
                <FormField
                    control={
                        <NativeCheckbox
                            id="includeUppercase"
                            name="includeUppercase"
                            checked={passwordConfig.includeUppercase}
                            onChange={updatePassword}
                        >
                            {t("Include uppercase")}
                        </NativeCheckbox>
                    }
                />
                <FormField
                    control={
                        <NativeCheckbox
                            id="includeLowercase"
                            name="includeLowercase"
                            checked={passwordConfig.includeLowercase}
                            onChange={updatePassword}
                        >
                            {t("Include lowercase")}
                        </NativeCheckbox>
                    }
                />
                <FormField
                    control={
                        <NativeCheckbox
                            id="includeNumbers"
                            name="includeNumbers"
                            checked={passwordConfig.includeNumbers}
                            onChange={updatePassword}
                        >
                            {t("Include numbers")}
                        </NativeCheckbox>
                    }
                />
                {passwordConfig.includeNumbers && (
                    <FormField layout="vertical"
                        label={t("Minimum numbers")}
                        htmlFor="minimumNumbers"
                        control={
                            <NativeInput
                                id="minimumNumbers"
                                name="minimumNumbers"
                                value={passwordConfig.minimumNumbers}
                                type="number"
                                min="1"
                                onChange={updatePassword}
                            />
                        }
                    />
                )}

                <FormField
                    control={
                        <NativeCheckbox
                            id="includeSymbols"
                            name="includeSymbols"
                            checked={passwordConfig.includeSymbols}
                            onChange={updatePassword}
                        >
                            {t("Include symbols")}
                        </NativeCheckbox>
                    }
                />
                {passwordConfig.includeSymbols && (
                    <FormField layout="vertical"
                        label={t("Minimum special")}
                        htmlFor="minimumSpecial"
                        control={
                            <NativeInput
                                id="minimumSpecial"
                                name="minimumSpecial"
                                value={passwordConfig.minimumSpecial}
                                type="number"
                                min="1"
                                onChange={updatePassword}
                            />
                        }
                    />
                )}

                <FormField
                    control={
                        <NativeCheckbox
                            id="avoidAmbiguous"
                            name="avoidAmbiguous"
                            checked={passwordConfig.avoidAmbiguous}
                            onChange={updatePassword}
                        >
                            {t("Avoid ambiguous")}
                        </NativeCheckbox>
                    }
                />

                <div className="field mt-4">
                    <label className="label">{t("Generated password")}</label>
                    <div className="control" style={{ display: "flex", gap: "8px" }}>
                        <NativeInput
                            className="input"
                            value={password}
                            readOnly
                            style={{ flex: 1 }}
                        />
                        <button className="button is-info" type="button" onClick={handleGenerate} title={t("Regenerate")}>
                            <CssIcon name="sync" />
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                    <SecondaryButton type="button" onClick={onClose}>
                        {t("Cancel")}
                    </SecondaryButton>
                    <PrimaryButton type="button" onClick={handleSelect} disabled={!password}>
                        {t("Use password")}
                    </PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default PasswordGeneratorModal;
