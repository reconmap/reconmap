import { useQueryClient } from "@tanstack/react-query";
import { useMutationPostDocument } from "api/documents.js";
import { actionCompletedToast } from "components/ui/toast";
import { errorToast } from "components/ui/toast.jsx";
import Document from "models/Document";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import DocumentForm from "./Form";

const AddDocumentPage = () => {
    const navigate = useNavigate();
    const [newDocument, setNewDocument] = useState({ ...Document, parentType: "library" });
    const { mutate: postDocumentMutation } = useMutationPostDocument();
    const queryClient = useQueryClient();

    const onFormSubmit = async (ev) => {
        ev.preventDefault();

        postDocumentMutation(newDocument, {
            onSuccess: () => {
                navigate(`/documents`);
                actionCompletedToast(`The document "${newDocument.title}" has been added.`);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: () => {
                errorToast(`Failed to add the document "${newDocument.title}".`);
            },
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/documents">Documents</Link>
                </Breadcrumb>
            </div>

            <Title title="New document details" />

            <DocumentForm onFormSubmit={onFormSubmit} document={newDocument} documentSetter={setNewDocument} />
        </div>
    );
};

export default AddDocumentPage;
