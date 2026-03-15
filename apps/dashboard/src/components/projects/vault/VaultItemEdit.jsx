import NativeButton from "components/form/NativeButton";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import Vault from "models/Vault";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { requestEntityPost, requestEntityPut } from "utilities/requests.js";

const VaultItemEdit = () => {
    const { vaultItemId } = useParams();

    const [item, setVaultItem] = useState({ ...Vault });
    const [password, setPassword] = useState(null);

    const onVaultItemFormChange = (ev) => {
        const value = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value;
        setVaultItem({ ...item, [ev.target.name]: value });
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        item.password = password;

        requestEntityPut(`/secrets/${vaultItemId}`, item).then((resp) => {
            if (resp.status === 201) {
                setVaultItem({ ...Vault });
                setPassword(null);
                actionCompletedToast(`The vault item has been modified.`);
            } else {
                errorToast("The vault item could not be saved. Review the form data or check the application logs.");
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
                actionCompletedToast(`The vault item "${newItem.name}" has been loaded.`);
            })
            .catch((err) => {
                errorToast(err.message);
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
                                            onChange={onVaultItemFormChange}
                                            value={item.name || ""}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <NativeInput
                                            type="text"
                                            name="value"
                                            onChange={onVaultItemFormChange}
                                            value={item.value || ""}
                                            required
                                        />
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
                                        <NativeButton type="submit">Update</NativeButton>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
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
                        <NativeButton type="submit">Unprotect</NativeButton>
                    </form>
                </>
            )}
        </div>
    );
};

export default VaultItemEdit;
