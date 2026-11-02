const STATUSES = {
    open: {
        label: "Open",
        className: "is-warning",
    },
    confirmed: {
        label: "Confirmed",
        className: "is-danger",
    },
    resolved: {
        label: "Resolved",
        className: "is-info",
    },
    closed: {
        label: "Closed",
        className: "is-success",
    },
};

const FindingStatusBadge = ({ finding }: any) => {
    const status = STATUSES[finding.status];

    return (
        <span className={`tag ${status.className}`}>
            <span className="has-text-weight-bold">{status.label}</span>
            {finding.substatus && <span>&nbsp;· {finding.substatus}</span>}
        </span>
    );
};

export default FindingStatusBadge;
