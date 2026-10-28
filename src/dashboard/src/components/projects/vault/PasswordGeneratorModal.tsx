import { useEffect, useRef, useState } from "react";
import { defaultPasswordConfiguration, generatePassword } from "services/passwords";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import { useTranslation } from "react-i18next";
import CssIcon from "components/ui/CssIcon";

// The parent mounts this component only while it is open, so each opening starts with a fresh password.
const PasswordGeneratorModal = ({ onClose, onSelectPassword }: any) => {
    const [t] = useTranslation();
    const dialogRef = useRef<any>(null);
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

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        dialog.showModal();
        return () => dialog.close();
    }, []);

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
        <dialog
            ref={dialogRef}
            onClose={onClose}
            style={{
                border: "none",
                borderRadius: "8px",
                padding: "24px",
                maxWidth: "450px",
                width: "90%",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
                backgroundColor: "#1f2937",
                color: "#f3f4f6",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                margin: 0,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 className="title is-4" style={{ color: "#f3f4f6", margin: 0 }}>{t("Password generator")}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        fontSize: "24px",
                        cursor: "pointer",
                        lineHeight: 1,
                    }}
                >
                    &times;
                </button>
            </div>

            <div className="content" style={{ color: "#d1d5db" }}>
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
                <FormField layout="vertical"
                    label={t("Include uppercase")}
                    htmlFor="includeUppercase"
                    control={
                        <NativeCheckbox
                            id="includeUppercase"
                            name="includeUppercase"
                            checked={passwordConfig.includeUppercase}
                            onChange={updatePassword}
                        />
                    }
                />
                <FormField layout="vertical"
                    label={t("Include lowercase")}
                    htmlFor="includeLowercase"
                    control={
                        <NativeCheckbox
                            id="includeLowercase"
                            name="includeLowercase"
                            checked={passwordConfig.includeLowercase}
                            onChange={updatePassword}
                        />
                    }
                />
                <FormField layout="vertical"
                    label={t("Include numbers")}
                    htmlFor="includeNumbers"
                    control={
                        <NativeCheckbox
                            id="includeNumbers"
                            name="includeNumbers"
                            checked={passwordConfig.includeNumbers}
                            onChange={updatePassword}
                        />
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

                <FormField layout="vertical"
                    label={t("Include symbols")}
                    htmlFor="includeSymbols"
                    control={
                        <NativeCheckbox
                            id="includeSymbols"
                            name="includeSymbols"
                            checked={passwordConfig.includeSymbols}
                            onChange={updatePassword}
                        />
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

                <FormField layout="vertical"
                    label={t("Avoid ambiguous")}
                    htmlFor="avoidAmbiguous"
                    control={
                        <NativeCheckbox
                            id="avoidAmbiguous"
                            name="avoidAmbiguous"
                            checked={passwordConfig.avoidAmbiguous}
                            onChange={updatePassword}
                        />
                    }
                />

                <div className="field mt-4">
                    <label className="label" style={{ color: "#f3f4f6" }}>{t("Generated password")}</label>
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
        </dialog>
    );
};

export default PasswordGeneratorModal;
