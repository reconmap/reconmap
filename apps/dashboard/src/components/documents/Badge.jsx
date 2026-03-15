import { Link } from "react-router-dom";

const styles = {
    badge: {
        alignItems: "center",
        display: `inline-flex`,
    },
};

const DocumentBadge = ({ document }) => {
    return (
        <Link to={"/documents/" + document.id} style={styles.badge}>
            {document.title}
        </Link>
    );
};

export default DocumentBadge;
