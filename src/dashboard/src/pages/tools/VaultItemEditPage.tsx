import FormActions from "components/forms/FormActions";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import { toast } from "components/ui/toast";
import Vault from "models/Vault";
import { useState } from "react";
import { HttpStatus } from "utilities/httpStatus";
import { useParams } from "react-router";
import { requestEntityPost, requestEntityPut } from "utilities/requests";
import CssIcon from "components/ui/CssIcon";
import PasswordGeneratorModal from "components/projects/vault/PasswordGeneratorModal";

const VaultItemEditPage = () => {
    const { vaultItemId } = useParams() as any;

    const [item, setVaultItem] = useState({ ...Vault });
    const [password, setPassword] = useState<any>(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const onVaultItemFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
        setVaultItem({ ...item, [ev.target.name]: value });
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        const payload = { ...item, password };

        requestEntityPut(`/secrets/${vaultItemId}`, payload as any).then((resp) => {
            if (resp.status === HttpStatus.CREATED) {
                setVaultItem({ ...Vault });
                setPassword(null);
                toast.success(`The vault item has been modified.`);
            } else {
                toast.error("The vault item could not be saved. Review the form data or check the application logs.");
            }
        });
    };

    const onPasswordProvided = (ev) => {
        ev.preventDefault();

        requestEntityPost(`/secrets/${vaultItemId}/decrypt`, { password })
            .then((resp) => {
                if (!resp.ok) {
                    throw new Error(`Error: ${resp.status} - ${resp.statusText}`);
                }
                return resp.json();
            })
            .then((json) => {
                var newItem = { ...Vault };
                newItem.name = json["name"];
                newItem.note = json["note"];
                newItem.value = json["value"];
                newItem.type = json["type"];
                setVaultItem(newItem);
                toast.success(`The vault item "${newItem.name}" has been loaded.`);
            })
            .catch((err) => {
                toast.error(err.message);
                setPassword(null);
            });
    };

    const onPasswordFormChanged = (ev) => {
        setPassword(ev.target.value);
    };

    return (
        <div>
            {item.name !== "" && (
                <>
                    <form onSubmit={onFormSubmit}>
                        <h3>Vault item</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                    <th>Notes</th>
                                    <th>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <NativeSelect
                                            name="type"
                                            aria-label="Type"
                                            onChange={onVaultItemFormChange}
                                            value={item.type || ""}
                                            required
                                        >
                                            <option value="password">Password</option>
                                            <option value="note">Note</option>
                                            <option value="token">Token</option>
                                            <option value="key">Key</option>
                                        </NativeSelect>
                                    </td>
                                    <td>
                                        <NativeInput
                                            type="text"
                                            name="name"
                                            aria-label="Name"
                                            onChange={onVaultItemFormChange}
                                            value={item.name || ""}
                                            required
                                        />
                                    </td>
                                    <td aria-label="Value">
                                        <div className="field has-addons" style={{ marginBottom: 0 }}>
                                            <div className="control is-expanded">
                                                <NativeInput
                                                    type="text"
                                                    name="value"
                                                    aria-label="Value"
                                                    onChange={onVaultItemFormChange}
                                                    value={item.value || ""}
                                                    required
                                                />
                                            </div>
                                            <div className="control">
                                                <button
                                                    type="button"
                                                    className="button is-info"
                                                    onClick={() => setIsGeneratorOpen(true)}
                                                    title="Generate Password…"
                                                    aria-label="Generate Password…"
                                                >
                                                    <CssIcon name="key" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <NativeInput
                                            type="text"
                                            name="note"
                                            onChange={onVaultItemFormChange}
                                            value={item.note || ""}
                                        />
                                    </td>
                                    <td>
                                        <PrimaryButton type="submit">Save</PrimaryButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                    {isGeneratorOpen && (
                        <PasswordGeneratorModal
                            onClose={() => setIsGeneratorOpen(false)}
                            onSelectPassword={(pwd) => {
                                setVaultItem({ ...item, value: pwd });
                            }}
                        />
                    )}
                </>
            )}
            {(item.name === "" || item.name === undefined) && (
                <>
                    <h3>Please provide password</h3>
                    <form onSubmit={onPasswordProvided}>
                        <NativeInput
                            type="password"
                            name="password"
                            onChange={onPasswordFormChanged}
                            value={password || ""}
                            autoComplete="off"
                            required
                        />
                        <FormActions>
                            <PrimaryButton type="submit">Unprotect</PrimaryButton>
                        </FormActions>
                    </form>
                </>
            )}
        </div>
    );
};

export default VaultItemEditPage;
