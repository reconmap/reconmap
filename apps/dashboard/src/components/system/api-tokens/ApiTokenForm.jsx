import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiTokenScope } from "api/user-api-tokens";
import { useUserApiTokenCreateMutation } from "api/user-api-tokens-hooks";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import PrimaryButton from "../../ui/buttons/Primary";
import SecondaryButton from "../../ui/buttons/Secondary";

const ApiTokenForm = ({ onSuccess, onCancel }) => {
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
            <h3>{t("Create API Token")}</h3>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>{t("Token name")}</label>
                <NativeInput 
                    type="text" 
                    value={name} 
                    onChange={(ev) => setName(ev.target.value)} 
                    placeholder={t("My development token")} 
                    required
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>{t("Expiration (days)")}</label>
                <NativeInput 
                    type="number" 
                    value={expirationDays} 
                    onChange={(ev) => setExpirationDays(parseInt(ev.target.value))} 
                    min="1" 
                    required
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>{t("Scope")}</label>
                <NativeSelect value={scope} onChange={(ev) => setScope(ev.target.value)}>
                    <option value={ApiTokenScope.Full}>{t("Full scope")}</option>
                    <option value={ApiTokenScope.ReadOnly}>{t("Read-only")}</option>
                </NativeSelect>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <PrimaryButton type="submit" disabled={createMutation.isPending}>{t("Create")}</PrimaryButton>
                <SecondaryButton type="button" onClick={onCancel}>{t("Cancel")}</SecondaryButton>
            </div>
        </form>
    );
};

export default ApiTokenForm;
