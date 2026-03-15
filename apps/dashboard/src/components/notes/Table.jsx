import RestrictedComponent from "components/logic/RestrictedComponent";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import RelativeDateFormatter from "components/ui/RelativeDateFormatter";
import VisibilityLegend from "components/ui/VisibilityLegend";
import ReactMarkdown from "react-markdown";

const NotesTable = ({ notes, onDeleteButtonClick }) => {
    if (!notes || notes.length === 0) {
        return <>No comments</>;
    }

    return (
        <div className="container mt-5">
            <h3 className="title is-4 has-text-white">Comments</h3>

            {notes.map((note) => (
                <div className="box has-background-dark has-text-white">
                    <div className="media">
                        <div className="media-content">
                            <p className="mb-2">
                                {" "}
                                <blockquote style={{ fontSize: "large" }}>
                                    <ReactMarkdown>{note.content}</ReactMarkdown>
                                </blockquote>
                            </p>
                            <p className="is-size-7 has-text-grey-light">
                                <VisibilityLegend visibility={note.visibility} /> · Posted by {note.createdBy?.fullName} · <RelativeDateFormatter date={note.createdAt} />
                            </p>
                        </div>
                        <div className="media-right">
                            <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                                <DeleteIconButton onClick={(ev) => onDeleteButtonClick(ev, note)} />
                            </RestrictedComponent>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotesTable;
