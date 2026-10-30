// Fear not, we also check these permissions on the server side.
const UserPermissions = {
    administrator: ["*.*"],
    superuser: ["findings.*", "commands.*", "tasks.*", "projects.*", "users.*", "clients.*"],
    user: ["findings.*", "commands.*", "tasks.*", "projects.*"],
    client: ["projects.list"],
};

export default UserPermissions;
