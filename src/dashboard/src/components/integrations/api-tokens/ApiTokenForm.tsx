import { ApiTokenScope } from "api/user-api-tokens";
import { useUserApiTokenCreateMutation } from "api/user-api-tokens-hooks";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../ui/buttons/PrimaryButton";
import SecondaryButton from "../../ui/buttons/SecondaryButton";

const ApiTokenForm = ({ onSuccess, onCancel }: any) => {
    const [t] = useTranslation();
    const [name, setName] = useState("");
    const [expirationDays, setExpirationDays] = useState(30);
    const [scope, setScope] = useState(ApiTokenScope.Full);
    const createMutation = useUserApiTokenCreateMutation();

    const onSubmit = (ev) => {
        ev.preventDefault();
        createMutation.mutate({ name, expirationDays, scope }, {
            onSuccess: (data) => {
                onSuccess(data);
            }
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <FormField
                htmlFor="apiTokenName"
                label={t("Token name")}
                control={
                    <NativeInput
                        id="apiTokenName"
                        type="text"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                        placeholder={t("My development token")}
                        required
                    />
                }
            />
            <FormField
                htmlFor="apiTokenExpirationDays"
                label={t("Expiration (days)")}
                control={
                    <NativeInput
                        id="apiTokenExpirationDays"
                        type="number"
                        value={expirationDays}
                        onChange={(ev) => setExpirationDays(parseInt(ev.target.value))}
                        min="1"
                        required
                    />
                }
            />
            <FormField
                htmlFor="apiTokenScope"
                label={t("Scope")}
                control={
                    <NativeSelect id="apiTokenScope" value={scope} onChange={(ev) => setScope(ev.target.value)}>
                        <option value={ApiTokenScope.Full}>{t("Full scope")}</option>
                        <option value={ApiTokenScope.ReadOnly}>{t("Read-only")}</option>
                    </NativeSelect>
                }
            />
            <div style={{ display: 'flex', gap: '10px' }}>
                <PrimaryButton type="submit" disabled={createMutation.isPending}>{t("Save")}</PrimaryButton>
                <SecondaryButton type="button" onClick={onCancel}>{t("Cancel")}</SecondaryButton>
            </div>
        </form>
    );
};

export default ApiTokenForm;
