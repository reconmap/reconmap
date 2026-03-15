const STATUSES = {
    open: {
        label: "Open",
        color: "yellow",
    },
    confirmed: {
        label: "Confirmed",
        color: "orange",
    },
    resolved: {
        label: "Resolved",
        color: "blue",
    },
    closed: {
        label: "Closed",
        color: "green",
    },
};

const VulnerabilityStatusBadge = ({ vulnerability }) => {
    const styles = {
        badge: {
            color: `${STATUSES[vulnerability.status].color}`,
            backgroundColor: `var(--${STATUSES[vulnerability.status].color}Dark)`,
            alignItems: "center",
            display: `inline-flex`,
            border: `var(--borderWidth,2px) solid transparent`,
        },
    };
    return (
        <span style={styles.badge}>
            {STATUSES[vulnerability.status].label} ({vulnerability.substatus})
        </span>
    );
};

export default VulnerabilityStatusBadge;
