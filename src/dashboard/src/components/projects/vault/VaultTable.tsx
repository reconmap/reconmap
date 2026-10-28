import { useConfirm } from "components/ui/useConfirm";
import { requestSecretDelete } from "api/requests/vault";
import { useInvalidateVaultQueries } from "api/vault";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import ExternalLink from "components/ui/ExternalLink";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import NativeTable from "components/ui/tables/NativeTable";
import { toast } from "components/ui/toast";

const VaultTable = ({ secrets, onDelete }: any) => {
    const invalidateQueries = useInvalidateVaultQueries();
    const { confirm, confirmDialog } = useConfirm();
    const onVaultItemDelete = async (vaultItemId) => {
        if (!(await confirm("Are you sure you want to delete this vault item?"))) return;
        requestSecretDelete(vaultItemId)
            .then(() => {
                if (onDelete) onDelete();
                invalidateQueries();
                toast.success("The vault item has been deleted.");
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
            cell: secret => (secret.url ? <ExternalLink href={secret.url}>{secret.url}</ExternalLink> : "(none)")
        },
        {
            header: 'Expiration date',
            cell: secret => (
                secret.expirationDate ? (
                    <>
                        {secret.expirationDate}
                        <br />
                        (<RelativeDateFormatter date={secret.expirationDate} />)
                    </>
                ) : (
                    "(none)"
                )
            )
        },
        {
            header: 'Notes',
            property: 'note',
        },
        {
            header: '',
            cell: secret => <><LinkButton href={`/vault/${secret.id}/edit`}>Edit</LinkButton>
                <DeleteButton display="icon" onClick={onVaultItemDelete.bind(this, secret.id)} /></>
        }
    ]

    return (
        <>
            <NativeTable rows={secrets} rowId={secret => secret.id} columns={columns}>
            </NativeTable>
            {confirmDialog}
        </>
    );
};

export default VaultTable;
