import { ApiTokenScope } from "api/user-api-tokens";
import { useUserApiTokenCreateMutation } from "api/user-api-tokens-hooks";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import NativeButton from "components/forms/NativeButton";
import ModalDialog from "components/ui/ModalDialog";
import PrimaryButton from "../../ui/buttons/PrimaryButton";

const ApiTokenModalDialog = ({ isOpen, onSuccess, onCancel }: any) => {
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
        <ModalDialog
            visible={isOpen}
            onModalClose={onCancel}
            title={t("New API token")}
            footer={
                <>
                    <NativeButton type="button" onClick={onCancel}>{t("Cancel")}</NativeButton>
                    <PrimaryButton type="submit" form="api-token-form" disabled={createMutation.isPending}>{t("Save")}</PrimaryButton>
                </>
            }
        >
            <form id="api-token-form" onSubmit={onSubmit}>
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
            </form>
        </ModalDialog>
    );
};

export default ApiTokenModalDialog;
