import { useInvalidateVaultQueries } from "api/vault";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import { toast } from "components/ui/toast";
import Vault from "models/Vault";
import { useState } from "react";
import { HttpStatus } from "utilities/httpStatus";
import { requestEntityPost } from "utilities/requests";
import CssIcon from "components/ui/CssIcon";
import PasswordGeneratorModal from "./PasswordGeneratorModal";

const VaultSecretForm = ({ projectId = null, onSubmit = null }: any) => {
    const defaultSecret = { ...Vault, projectId: projectId };
    const [vaultItem, setVaultItem] = useState(defaultSecret);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const invalidateQueries = useInvalidateVaultQueries();

    const onVaultItemFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
        setVaultItem({ ...vaultItem, [ev.target.name]: value });
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        requestEntityPost("/secrets", vaultItem as any).then((resp) => {
            if (resp.status === HttpStatus.CREATED) {
                setVaultItem(defaultSecret);
                if (onSubmit) onSubmit();
                invalidateQueries();
                toast.success(`The vault item has been added.`);
            } else {
                toast.error("The vault item could not be saved. Review the form data or check the application logs.");
            }
        });
    };

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <details>
                <summary>New vault secret</summary>

                <FormField
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

                <FormField
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

                <FormField
                    label="Value"
                    htmlFor="value"
                    control={
                        <div className="field has-addons" style={{ marginBottom: 0 }}>
                            <div className="control is-expanded">
                                <NativeInput
                                    type="text"
                                    name="value"
                                    onChange={onVaultItemFormChange}
                                    value={vaultItem.value || ""}
                                    required
                                />
                            </div>
                            <div className="control">
                                <button
                                    type="button"
                                    className="button is-info"
                                    onClick={() => setIsGeneratorOpen(true)}
                                    title="Generate Password"
                                >
                                    <CssIcon name="key" />
                                </button>
                            </div>
                        </div>
                    }
                />

                <FormField
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

                <FormField
                    label="Expiration date"
                    htmlFor="expirationDate"
                    control={
                        <NativeInput
                            type="date"
                            name="expirationDate"
                            onChange={onVaultItemFormChange}
                            value={(vaultItem as any).expirationDate || ""}
                        />
                    }
                />

                <FormField
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

                <FormField
                    label="Protection password"
                    htmlFor="password"
                    control={
                        <NativeInput
                            type="password"
                            name="password"
                            onChange={onVaultItemFormChange}
                            value={(vaultItem as any).password || ""}
                            autoComplete="off"
                            required
                        />
                    }
                />

                <PrimaryButton type="submit">Save</PrimaryButton>
            </details>
            {isGeneratorOpen && (
                <PasswordGeneratorModal
                    onClose={() => setIsGeneratorOpen(false)}
                    onSelectPassword={(pwd) => {
                        setVaultItem({ ...vaultItem, value: pwd });
                    }}
                />
            )}
        </Form>
    );
};

export default VaultSecretForm;
