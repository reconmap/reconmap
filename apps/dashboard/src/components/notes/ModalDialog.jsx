import { requestCommentPost } from "api/requests/comments.js";
import NativeButton from "components/form/NativeButton";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import ModalDialog from "components/ui/ModalDIalog";
import { actionCompletedToast } from "components/ui/toast";
import { errorToast } from "components/ui/toast.jsx";
import { StatusCodes } from "http-status-codes";
import Note from "models/Note";
import { useState } from "react";
import NotesForm from "./Form";

const NoteModalDialog = ({ parentType, parent, isOpen, onClose, onCancel }) => {
    const emptyNote = {
        ...Note,
        content: "",
        parentType: parentType,
        parentId: parent.id,
        visibility: "public",
    };
    const [newNote, updateNewNote] = useState(emptyNote);

    const beforeCancelCallback = (ev) => {
        updateNewNote(emptyNote);
        onCancel(ev);
    };

    const onCreateNoteFormSubmit = async (ev) => {
        ev.preventDefault();

        requestCommentPost(newNote)
            .then((resp) => {
                if (resp.status !== StatusCodes.CREATED) {
                    throw new Error(`Failed to create note. Status code: ${resp.status}`);
                }
                onClose();
                actionCompletedToast(`The note has been created.`);
                updateNewNote(emptyNote);
            })
            .catch((err) => {
                errorToast(`Error creating note: ${err.message}`);
            });
    };

    return (
        <ModalDialog title="New notes details" visible={isOpen} onModalClose={beforeCancelCallback}>
            <NotesForm note={newNote} onFormSubmit={onCreateNoteFormSubmit} noteSetter={updateNewNote} />

            <div style={{ paddingTop: "20px" }}>
                <NativeButton onClick={beforeCancelCallback}>Cancel</NativeButton>
                <PrimaryButton onClick={onCreateNoteFormSubmit}>Save</PrimaryButton>
            </div>
        </ModalDialog>
    );
};

export default NoteModalDialog;
