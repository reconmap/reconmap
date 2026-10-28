import DeleteButton from "components/ui/buttons/DeleteButton";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import UserLink from "components/users/UserLink";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import styles from "./CommentCard.module.css";

export interface Comment {
    id: number;
    content: string;
    createdById?: number;
    createdBy?: { fullName?: string };
    createdAt?: string;
}

interface CommentCardProps {
    comment: Comment;
    canDelete: boolean;
    onDelete: () => void;
}

const CommentCard = ({ comment, canDelete, onDelete }: CommentCardProps) => {
    const { t } = useTranslation();

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <p className={styles.meta}>
                    <span>{t("Posted by")}</span>{" "}
                    <UserLink userId={comment.createdById}>{comment.createdBy?.fullName}</UserLink>
                    <span aria-hidden="true"> · </span>
                    <RelativeDateFormatter date={comment.createdAt} />
                </p>
                {canDelete && <DeleteButton display="icon" aria-label={t("Delete comment")} onClick={onDelete} />}
            </header>
            <div className={`content ${styles.body}`}>
                <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>
        </article>
    );
};

export default CommentCard;
