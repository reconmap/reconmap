import { useVaultQuery } from "api/vault.js";
import VaultSecretForm from "components/projects/vault/VaultSecretForm.jsx";
import VaultTable from "components/projects/vault/VaultTable.jsx";

const VaultPage = () => {
    const { data: secrets } = useVaultQuery();

    return (
        <>
            <h3 className="title is-3">Vault</h3>

            <VaultSecretForm onSubmit={() => {}} />

            <VaultTable secrets={secrets} onDelete={() => {}} />
        </>
    );
};

export default VaultPage;
