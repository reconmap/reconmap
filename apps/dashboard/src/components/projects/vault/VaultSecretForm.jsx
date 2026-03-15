import { invalidateVaultQueries } from "api/vault.js";
import HorizontalLabelledField from "components/form/HorizontalLabelledField.jsx";
import NativeInput from "components/form/NativeInput.jsx";
import NativeSelect from "components/form/NativeSelect.jsx";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import { actionCompletedToast } from "components/ui/toast.jsx";
import Vault from "models/Vault.js";
import { useState } from "react";
import { requestEntityPost } from "utilities/requests.js";

const VaultSecretForm = ({ projectId = null, onSubmit = null }) => {
    const defaultSecret = { ...Vault, projectId: projectId };
    const [vaultItem, setVaultItem] = useState(defaultSecret);
    const invalidateQueries = invalidateVaultQueries();

    const onVaultItemFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
        setVaultItem({ ...vaultItem, [ev.target.name]: value });
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestEntityPost("/secrets", vaultItem).then((resp) => {
            if (resp.status === 201) {
                setVaultItem(defaultSecret);
                if (onSubmit) onSubmit();
                invalidateQueries();
                actionCompletedToast(`The vault item has been added.`);
            } else {
                errorToast("The vault item could not be saved. Review the form data or check the application logs.");
            }
        });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <details>
                <summary>New vault secret</summary>

                <HorizontalLabelledField
                    label="Type"
                    htmlFor="type"
                    control={
                        <NativeSelect
                            id="type"
                            name="type"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.type || ""}
                            required
                        >
                            <option value="password">Password</option>
                            <option value="note">Note</option>
                            <option value="token">Token</option>
                            <option value="key">Key</option>
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField
                    label="Name"
                    htmlFor="name"
                    control={
                        <NativeInput
                            type="text"
                            id="name"
                            name="name"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.name || ""}
                            required
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Value"
                    htmlFor="value"
                    control={
                        <NativeInput
                            type="text"
                            name="value"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.value || ""}
                            required
                        />
                    }
                />

                <HorizontalLabelledField
                    label="URL"
                    htmlFor="url"
                    control={
                        <NativeInput
                            type="url"
                            id="url"
                            name="url"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.url || ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Expiration date"
                    htmlFor="expirationDate"
                    control={
                        <NativeInput
                            type="date"
                            name="expirationDate"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.expirationDate || ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Note"
                    htmlFor="note"
                    control={
                        <NativeInput
                            type="text"
                            name="note"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.note || ""}
                        />
                    }
                />

                <HorizontalLabelledField
                    label="Protection password"
                    htmlFor="password"
                    control={
                        <NativeInput
                            type="password"
                            name="password"
                            onChange={onVaultItemFormChange}
                            value={vaultItem.password || ""}
                            autoComplete="off"
                            required
                        />
                    }
                />

                <PrimaryButton type="submit">Add</PrimaryButton>
            </details>
        </form>
    );
};

export default VaultSecretForm;
