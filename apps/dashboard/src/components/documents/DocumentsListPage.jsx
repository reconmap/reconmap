import { useDocuments, useQueryDeleteDocument } from "api/documents.js";
import CreateButton from "components/ui/buttons/Create";
import Title from "components/ui/Title";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb.jsx";
import DocumentsTable from "./Table.jsx";

const DocumentsListPage = () => {
    const navigate = useNavigate();
    const { data: documents, isLoading } = useDocuments();
    const deleteMutation = useQueryDeleteDocument();

    const onAddCommandClick = (ev) => {
        ev.preventDefault();

        navigate("/documents/add");
    };

    const onDeleteClick = (documentId) => {
        deleteMutation.mutate(documentId);
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb />
                <CreateButton onClick={onAddCommandClick}>Create document</CreateButton>
            </div>
            <Title title="Documents" />

            {isLoading ? (
                <div>Loading&hellip;</div>
            ) : (
                <DocumentsTable documents={documents} onDeleteButtonClick={onDeleteClick} />
            )}
        </div>
    );
};

export default DocumentsListPage;
