import { useDeleteCommentMutation, useNotesQuery } from "api/comments";
import RestrictedComponent from "components/logic/RestrictedComponent";
import NoteModalDialog from "components/notes/ModalDialog";
import CreateButton from "components/ui/buttons/Create";
import useBoolean from "hooks/useBoolean";
import NotesTable from "../notes/Table";
import Skeleton from "../ui/Skeleton";

const ProjectNotesTab = ({ project }: any) => {
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

            {isLoading ? (
                <div className="mt-5">
                    <Skeleton height="5rem" />
                </div>
            ) : (
                <NotesTable notes={notes} onDeleteButtonClick={onDeleteButtonClick} />
            )}
        </section>
    );
};

export default ProjectNotesTab;
