import { useDeleteCommentMutation, useNotesQuery } from "api/comments.js";
import RestrictedComponent from "components/logic/RestrictedComponent";
import NoteModalDialog from "components/notes/ModalDialog";
import CreateButton from "components/ui/buttons/Create";
import useBoolean from "hooks/useBoolean";
import NotesTable from "../notes/Table";
import Loading from "../ui/Loading";

const ProjectNotesTab = ({ project }) => {
    const { data: notes, isLoading, refetch } = useNotesQuery({ parentType: "project", parentId: project.id });
    const deleteCommentMutation = useDeleteCommentMutation();
    const { value: isOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean();

    const onDeleteButtonClick = (ev, note) => {
        ev.preventDefault();

        deleteCommentMutation.mutate(note.id);
    };

    const onNoteFormSaved = () => {
        closeDialog();
        refetch();
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <section>
            <h4 className="title is-4">Project comments</h4>
            <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                <NoteModalDialog
                    parentType="project"
                    parent={project}
                    isOpen={isOpen}
                    onClose={onNoteFormSaved}
                    onCancel={closeDialog}
                />
                <CreateButton onClick={openDialog}>Add comment&hellip;</CreateButton>
            </RestrictedComponent>

            <NotesTable notes={notes} onDeleteButtonClick={onDeleteButtonClick} />
        </section>
    );
};

export default ProjectNotesTab;
