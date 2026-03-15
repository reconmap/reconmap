import { useQueryClient } from "@tanstack/react-query";
import { useDocumentQuery } from "api/documents.js";
import { requestDocumentPut } from "api/requests/documents.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import { actionCompletedToast } from "../ui/toast";
import DocumentForm from "./Form";

const EditDocumentPage = () => {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const queryClient = useQueryClient();

    const { data: serverDocument } = useDocumentQuery(documentId);
    const [clientDocument, setClientDocument] = useState(null);

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        await requestDocumentPut(documentId, clientDocument);
        queryClient.invalidateQueries({ queryKey: ["documents", documentId] });

        actionCompletedToast(`The document "${clientDocument.title}" has been updated.`);

        navigate(`/documents/${documentId}`);
    };

    useEffect(() => {
        if (serverDocument) setClientDocument(serverDocument);
    }, [serverDocument]);

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/documents">Documents</Link>
                </Breadcrumb>
            </div>

            <Title title="Document details" />

            {!clientDocument ? (
                <Loading />
            ) : (
                <DocumentForm
                    isEditForm={true}
                    onFormSubmit={onFormSubmit}
                    document={clientDocument}
                    documentSetter={setClientDocument}
                />
            )}
        </div>
    );
};

export default EditDocumentPage;
