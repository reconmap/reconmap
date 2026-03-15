import { useDocuments } from "api/documents.js";
import DocumentBadge from "components/documents/Badge";
import Loading from "components/ui/Loading";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import DashboardWidget from "./Widget";

const RecentDocumentsWidget = () => {
    const { data: documents, isLoading } = useDocuments(5);

    if (isLoading) return <Loading />;

    return (
        <DashboardWidget title="Recent documents">
            {documents.length === 0 ? (
                <p>No documents to show.</p>
            ) : (
                <table className="table is-fullwidth">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td>
                                    <DocumentBadge key={doc.id} document={doc} />
                                </td>
                                <td>
                                    <RelativeDateFormatter date={doc.createdAt} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </DashboardWidget>
    );
};

export default RecentDocumentsWidget;
