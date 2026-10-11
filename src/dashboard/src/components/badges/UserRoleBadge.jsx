const roles = {
    administrator: "red",
    superuser: "blue",
    user: "green",
    client: "yellow",
};

const UserRoleBadge = ({ role }) => {
    const color = roles.hasOwnProperty(role) ? roles[role] : "yellow";

    const styles = {
        color: color,
    };

    return <span style={styles}>{role}</span>;
};

export default UserRoleBadge;
