import { NewComment, useCommentsQuery, useCreateCommentMutation, useDeleteCommentMutation } from "api/comments";
import NativeTextArea from "components/forms/NativeTextArea";
import RestrictedComponent from "components/logic/RestrictedComponent";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import PrimaryButton from "components/ui/buttons/Primary";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import Skeleton from "components/ui/Skeleton";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import UserLink from "components/users/Link";
import { AuthContext } from "contexts/AuthContext";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

const COMMENTING_ROLES = ["administrator", "superuser", "user"];
const MODERATING_ROLES = ["administrator", "superuser"];

interface Comment {
    id: number;
    content: string;
    createdById?: number;
    createdBy?: { fullName?: string };
    createdAt?: string;
}

interface CommentsPanelProps {
    parentType: "project" | "vulnerability";
    parentId: number;
}

const CommentsPanel = ({ parentType, parentId }: CommentsPanelProps) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const { data: comments, isLoading } = useCommentsQuery({ parentType, parentId });
    const createCommentMutation = useCreateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();
    const [content, setContent] = useState("");

    const canDelete = (comment: Comment) =>
        !!user && (comment.createdById === user.id || MODERATING_ROLES.includes(user.role));

    const onSubmit = (ev) => {
        ev.preventDefault();

        const newComment: NewComment = { parentType, parentId, content };
        createCommentMutation.mutate(newComment, {
            onSuccess: () => {
                setContent("");
                actionCompletedToast(t("Comment added."));
            },
            onError: () => errorToast(t("Could not add the comment.")),
        });
    };

    const onDeleteClick = (comment: Comment) => {
        if (!window.confirm(t("Are you sure you want to delete this comment?"))) {
            return;
        }

        deleteCommentMutation.mutate(comment.id, {
            onSuccess: () => actionCompletedToast(t("Comment deleted.")),
            onError: () => errorToast(t("Could not delete the comment.")),
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
                        onChange={(ev) => setContent(ev.target.value)}
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
                    <article key={comment.id} className="box has-background-dark has-text-white">
                        <div className="is-flex is-justify-content-space-between is-align-items-flex-start">
                            <div className="content has-text-white">
                                <ReactMarkdown>{comment.content}</ReactMarkdown>
                            </div>
                            {canDelete(comment) && (
                                <DeleteIconButton aria-label={t("Delete comment")} onClick={() => onDeleteClick(comment)} />
                            )}
                        </div>
                        <p className="is-size-7 has-text-grey-light">
                            {t("Posted by")}{" "}
                            <UserLink userId={comment.createdById}>{comment.createdBy?.fullName}</UserLink>
                            {" · "}
                            <RelativeDateFormatter date={comment.createdAt} />
                        </p>
                    </article>
                ))
            )}
        </section>
    );
};

export default CommentsPanel;
