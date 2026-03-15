import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import VisibilityLegend from "components/ui/VisibilityLegend";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import UserLink from "components/users/Link";
import DocumentBadge from "./Badge";

const DocumentsTable = ({ documents, onDeleteButtonClick }) => {
    const columns = [
        {
            header: 'Title',
            cell: document => <DocumentBadge document={document} />
        },
        {
            header: 'Creation time',
            cell: document => <RelativeDateFormatter date={document.createdAt} />,
            style: { width: "200px" }
        },
        {
            header: 'Author',
            cell: document => <UserLink userId={document.createdByUid}>{document.createdBy.fullName}</UserLink>,
            style: { width: "140px" }
        },
        {
            header: 'Visibility',
            cell: document => <VisibilityLegend visibility={document.visibility} />,
            style: { width: "140px" }
        },
        {
            header: '',
            cell: document => (
                <>
                    <LinkButton href={`/documents/${document.id}/edit`}>Edit</LinkButton>
                    <DeleteIconButton onClick={() => onDeleteButtonClick(document.id)} />
                </>
            ),
            style: { textAlign: "right" }
        }
    ]
    return (
        <NativeTable rows={documents} rowId={document => document.id} columns={columns}>
        </NativeTable>
    );
};

export default DocumentsTable;
