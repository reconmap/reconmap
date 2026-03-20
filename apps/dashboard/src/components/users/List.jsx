import { useQueryClient } from "@tanstack/react-query";
import { deleteUsers } from "api/requests/users.js";
import { useUserDeleteMutation, useUsersQuery } from "api/users.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import RestrictedComponent from "components/logic/RestrictedComponent";
import BooleanText from "components/ui/BooleanText";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ExportMenuItem from "components/ui/menuitems/ExportMenuItem";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import Title from "components/ui/Title";
import { AuthContext } from "contexts/AuthContext";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateButton from "../../components/ui/buttons/Create";
import UserAvatar from "../badges/UserAvatar";
import UserRoleBadge from "../badges/UserRoleBadge";
import Breadcrumb from "../ui/Breadcrumb";
import DeleteButton from "../ui/buttons/Delete";
import LinkButton from "../ui/buttons/Link";
import { actionCompletedToast } from "../ui/toast";
import { LastLogin } from "./LastLogin";
import UserLink from "./Link";

const UsersList = () => {
    const navigate = useNavigate();
    const { user: loggedInUser } = useContext(AuthContext);
    const { data: users, isLoading } = useUsersQuery();
    const userDeleteMutation = useUserDeleteMutation();
    const queryClient = useQueryClient();

    const handleCreate = () => {
        navigate("/users/create");
    };

    const [selectedUsers, setSelectedUsers] = useState([]);

    const onTaskCheckboxChange = (ev) => {
        const target = ev.target;
        const targetUserId = parseInt(target.value);
        if (target.checked) {
            setSelectedUsers([...selectedUsers, targetUserId]);
        } else {
            setSelectedUsers(selectedUsers.filter((value) => value !== targetUserId));
        }
    };

    const handleBulkDelete = () => {
        deleteUsers(selectedUsers)
            .then(() => {
                setSelectedUsers([]);
                actionCompletedToast("All selected users were deleted.");
            })
            .catch((err) => console.error(err));
    };

    const onDeleteClick = (userId) => {
        userDeleteMutation.mutate(userId).then(() => { });
        queryClient.invalidateQueries({ queryKey: ["users"] });
    };

    const columns = [
        {
            header: <>&nbsp;</>,
            cell: (user) => (
                <input
                    type="checkbox"
                    value={user.id}
                    onChange={onTaskCheckboxChange}
                    checked={selectedUsers.includes(user.id)}
                />
            ),
        },
        {
            header: <>&nbsp;</>,
            cell: (user) => <UserAvatar email={user.email} />,
        },
        {
            header: "Full name",
            cell: (user) => <Link to={`/users/${user.id}`}>{user.fullName}</Link>,
        },
        {
            header: "Username",
            cell: (user) => <UserLink userId={user.id}>{user.username}</UserLink>,
        },
        {
            header: "Role",
            cell: (user) => <UserRoleBadge role={user.role} />,
        },
        {
            header: "Active?",
            cell: (user) => <BooleanText value={user.active} />,
        },
        {
            header: "Last login time",
            cell: (user) => <LastLogin user={user} />,
        },
        {
            header: "2FA enabled?",
            cell: (user) => <BooleanText value={user.mfa_enabled} />,
        },
        {
            header: <>&nbsp;</>,
            cell: (user) => (
                <div style={{ textAlign: "right" }}>
                    <LinkButton href={`/users/${user.id}/edit`}>Edit</LinkButton>
                    <DeleteIconButton
                        onClick={() => onDeleteClick(user.id)}
                        disabled={Number(user.id) === loggedInUser?.id}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <Breadcrumb />
                <NativeButtonGroup>
                    <CreateButton onClick={handleCreate}>Create user</CreateButton>
                    <RestrictedComponent roles={["administrator"]}>
                        <DeleteButton onClick={handleBulkDelete} disabled={selectedUsers.length === 0}>
                            Delete selected
                        </DeleteButton>
                    </RestrictedComponent>
                    <ul>
                        <li>
                            <ExportMenuItem entity="users" />
                        </li>
                    </ul>
                </NativeButtonGroup>
            </div>

            <Title title="Users" />

            <NativeTable
                columns={columns}
                rows={isLoading ? null : users}
                rowId={(user) => user.id}
                emptyRowsMessage="No users available."
            ></NativeTable>
        </>
    );
};

export default UsersList;
