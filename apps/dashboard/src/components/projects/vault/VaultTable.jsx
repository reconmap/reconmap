import { requestSecretDelete } from "api/requests/vault.js";
import { invalidateVaultQueries } from "api/vault.js";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton.jsx";
import LinkButton from "components/ui/buttons/Link.jsx";
import ExternalLink from "components/ui/ExternalLink.jsx";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter.jsx";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import { actionCompletedToast } from "components/ui/toast.jsx";

const VaultTable = ({ secrets, onDelete }) => {
    const invalidateQueries = invalidateVaultQueries();
    const onVaultItemDelete = (vaultItemId) => {
        requestSecretDelete(vaultItemId)
            .then(() => {
                if (onDelete) onDelete();
                invalidateQueries();
                actionCompletedToast("The vault item has been deleted.");
            })
            .catch((err) => console.error(err));
    };

    const columns = [
        {
            header: 'Type',
            property: 'type',
        },
        {
            header: 'Name',
            property: 'name',
        },
        {
            header: 'URL',
            cell: secret => { secret.url ? <ExternalLink href={secret.url}>{secret.url}</ExternalLink> : "(none)" }
        },
        {
            header: 'Expiration date',
            cell: secret => {
                secret.expirationDate ? (
                    <>
                        {secret.expirationDate}
                        <br />
                        (<RelativeDateFormatter date={secret.expirationDate} />)
                    </>
                ) : (
                    "(none)"
                )
            }
        },
        {
            header: 'Notes',
            property: 'note',
        },
        {
            header: '',
            cell: secret => <><LinkButton href={`/vault/${secret.id}/edit`}>Edit</LinkButton>
                <DeleteIconButton onClick={onVaultItemDelete.bind(this, secret.id)} /></>
        }
    ]

    return (
        <NativeTable rows={secrets} rowId={secret => secret.id} columns={columns}>
        </NativeTable>
    );
};

export default VaultTable;
