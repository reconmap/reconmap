import { NewComment, useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from "api/comments";
import NativeTextArea from "components/forms/NativeTextArea";
import RestrictedComponent from "components/logic/RestrictedComponent";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import Skeleton from "components/ui/Skeleton";
import { toast } from "components/ui/toast";
import { useConfirm } from "components/ui/useConfirm";
import { AuthContext } from "contexts/AuthContext";
import { useContext, useState, type FormEvent, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import CommentCard, { Comment } from "./CommentCard";

const COMMENTING_ROLES = ["administrator", "superuser", "user"];
const MODERATING_ROLES = ["administrator", "superuser"];

interface CommentsPanelProps {
    parentType: "project" | "task" | "finding";
    parentId: string;
}

const CommentsPanel = ({ parentType, parentId }: CommentsPanelProps) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { confirm, confirmDialog } = useConfirm();
    const { data: comments, isLoading } = useCommentsQuery({ parentType, parentId });
    const createCommentMutation = useCreateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();
    const [content, setContent] = useState("");

    const canDelete = (comment: Comment) =>
        !!user && (comment.createdById === user.id || MODERATING_ROLES.includes(user.role));

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newComment: NewComment = { parentType, parentId, content };
        createCommentMutation.mutate(newComment, {
            onSuccess: () => {
                setContent("");
                toast.success(t("Comment added."));
            },
            onError: () => toast.error(t("Could not add the comment.")),
        });
    };

    const onDeleteClick = async (comment: Comment) => {
        if (!(await confirm(t("Are you sure you want to delete this comment?")))) {
            return;
        }

        deleteCommentMutation.mutate(comment.id, {
            onSuccess: () => toast.success(t("Comment deleted.")),
            onError: () => toast.error(t("Could not delete the comment.")),
        });
    };

    return (
        <section>
            <RestrictedComponent roles={COMMENTING_ROLES}>
                <form className="mb-5" onSubmit={onSubmit}>
                    <NativeTextArea
                        name="content"
                        aria-label={t("Comment")}
                        placeholder={t("Write a comment…")}
                        style={{ width: "100%" }}
                        value={content}
                        onChange={(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setContent(event.target.value)}
                        required
                    />
                    <div className="mt-3">
                        <PrimaryButton type="submit" disabled={createCommentMutation.isPending || content.trim() === ""}>
                            {t("Add comment")}
                        </PrimaryButton>
                    </div>
                </form>
            </RestrictedComponent>

            {isLoading ? (
                <Skeleton height="5rem" />
            ) : !comments?.length ? (
                <p className="has-text-grey">{t("No comments yet.")}</p>
            ) : (
                comments.map((comment: Comment) => (
                    <CommentCard
                        key={comment.id}
                        comment={comment}
                        canDelete={canDelete(comment)}
                        onDelete={() => onDeleteClick(comment)}
                    />
                ))
            )}
            {confirmDialog}
        </section>
    );
};

export default CommentsPanel;
