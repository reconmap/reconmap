const roles: Record<string, string> = {
    administrator: "is-danger",
    superuser: "is-info",
    user: "is-success",
    client: "is-warning",
};

const UserRoleBadge = ({ role }: { role?: string }) => {
    if (!role) return null;

    const color = roles[role] ?? "is-warning";

    return <span className={`tag is-light is-capitalized has-text-weight-semibold ${color}`}>{role}</span>;
};

export default UserRoleBadge;
