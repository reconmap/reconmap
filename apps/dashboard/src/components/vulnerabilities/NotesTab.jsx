import { useCreateCommentMutation, useDeleteCommentMutation, useNotesQuery } from "api/comments.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import NotesForm from "components/notes/Form";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import { actionCompletedToast } from "components/ui/toast";
import Note from "models/Note";
import { useState } from "react";
import NotesTable from "../notes/Table";

const VulnerabilitiesNotesTab = ({ vulnerability }) => {
    const { data: notes, refetch } = useNotesQuery({ parentType: "vulnerability", parentId: vulnerability.id });
    const createCommentMutation = useCreateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();

    const emptyNote = {
        ...Note,
        content: "",
        parentType: "vulnerability",
        parentId: vulnerability.id,
        visibility: "public",
    };
    const [newNote, updateNewNote] = useState(emptyNote);

    const onDeleteButtonClick = (ev, note) => {
        ev.preventDefault();

        deleteCommentMutation.mutate(note.id);
    };

    const onCreateNoteFormSubmit = async (ev) => {
        ev.preventDefault();

        createCommentMutation.mutate(newNote);
        actionCompletedToast(`The note has been created.`);
        await refetch();
        updateNewNote({ ...emptyNote, content: "" });
    };

    return (
        <section>
            <h4 className="title is-4">Vulnerability comments</h4>

            <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                <NotesForm
                    id="vulnerabilityCommentForm"
                    note={newNote}
                    onFormSubmit={onCreateNoteFormSubmit}
                    noteSetter={updateNewNote}
                />
            </RestrictedComponent>

            <div style={{ paddingTop: "20px" }}>
                <PrimaryButton type="submit" form="vulnerabilityCommentForm">
                    Save
                </PrimaryButton>
            </div>

            <NotesTable notes={notes} onDeleteButtonClick={onDeleteButtonClick} />
        </section>
    );
};

export default VulnerabilitiesNotesTab;
