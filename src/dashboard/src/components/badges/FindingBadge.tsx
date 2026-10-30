import { Link } from "react-router";

export default function FindingBadge({ finding }: any) {
    const styles = {
        badge: {
            alignItems: "center",
            display: `inline-flex`,
        },
    };

    return (
        <Link to={`/findings/${finding.id}`} style={styles.badge}>
            {finding.summary}
        </Link>
    );
}
