// Fear not, we also check these permissions on the server side.
const UserPermissions = {
    administrator: ["*.*"],
    superuser: ["vulnerabilities.*", "commands.*", "tasks.*", "projects.*", "users.*", "clients.*"],
    user: ["vulnerabilities.*", "commands.*", "tasks.*", "projects.*"],
    client: ["projects.list"],
};

export default UserPermissions;
