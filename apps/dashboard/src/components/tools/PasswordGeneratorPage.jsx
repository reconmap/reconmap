import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeButton from "components/form/NativeButton.jsx";
import NativeButtonGroup from "components/form/NativeButtonGroup.jsx";
import NativeCheckbox from "components/form/NativeCheckbox.jsx";
import NativeInput from "components/form/NativeInput.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import CssIcon from "components/ui/CssIcon.jsx";
import { actionCompletedToast, errorToast } from "components/ui/toast.jsx";
import { useEffect, useState } from "react";
import { defaultPasswordConfiguration, generatePassword } from "services/passwords.js";

const PasswordGeneratorPage = () => {
    const [passwordConfig, setPasswordConfig] = useState(defaultPasswordConfiguration);
    const [password, setPassword] = useState();

    const updatePassword = (ev) => {
        let value = ev.target.value;
        if (
            ["includeUppercase", "includeLowercase", "includeNumbers", "includeSymbols", "avoidAmbiguous"].includes(
                ev.target.name,
            )
        ) {
            value = ev.target.checked;
        }
        setPasswordConfig({ ...passwordConfig, [ev.target.name]: value });
    };

    const reset = () => {
        setPasswordConfig(defaultPasswordConfiguration);
    };

    const copyToClipboard = () => {
        navigator.clipboard
            .writeText(password)
            .then(() => {
                actionCompletedToast("Support info copied to the clipboard");
            })
            .catch((err) => {
                errorToast(err);
            });
    };

    useEffect(() => {
        try {
            const password = generatePassword(passwordConfig);
            setPassword(password);
        } catch (err) {
            errorToast(err.message);
        }
    }, [passwordConfig]);

    return (
        <div className="columns">
            <div className="column is-two-thirds">
                <h3 className="title is-3">Password generator</h3>
                <form>
                    <HorizontalLabelledField
                        label="Password length"
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
                    <HorizontalLabelledField
                        label="Include uppercase"
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
                    <HorizontalLabelledField
                        label="Include lowercase"
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
                    <HorizontalLabelledField
                        label="Include numbers"
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
                        <HorizontalLabelledField
                            label="Minimum numbers"
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

                    <HorizontalLabelledField
                        label="Include symbols"
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
                        <HorizontalLabelledField
                            label="Minimum special"
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

                    <HorizontalLabelledField
                        label="Avoid ambiguous"
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

                    <NativeInput className="input is-info" value={password} readOnly />

                    <hr />
                    <NativeButtonGroup>
                        <PrimaryButton onClick={copyToClipboard}>
                            <CssIcon name="clipboard" />
                            &nbsp;Copy to clipboard
                        </PrimaryButton>
                        <NativeButton type="reset" onClick={reset}>
                            Reset
                        </NativeButton>
                    </NativeButtonGroup>
                </form>
            </div>
        </div>
    );
};

export default PasswordGeneratorPage;
