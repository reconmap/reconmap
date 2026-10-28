import { useConfirm } from "components/ui/useConfirm";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUsers } from "api/requests/users";
import { useUserDeleteMutation, useUsersQuery } from "api/users";
import UserRoleBadge from "components/badges/UserRoleBadge";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import RestrictedComponent from "components/logic/RestrictedComponent";
import BooleanText from "components/ui/BooleanText";
import Breadcrumb from "components/ui/Breadcrumb";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import ExportMenuItem from "components/ui/menuitems/ExportMenuItem";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import { LastLogin } from "components/users/LastLogin";
import UserLink from "components/users/UserLink";
import { AuthContext } from "contexts/AuthContext";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const UsersListPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const navigate = useNavigate();
    const { user: loggedInUser } = useContext(AuthContext);
    const { data: users, isLoading } = useUsersQuery();
    const userDeleteMutation = useUserDeleteMutation();
    const queryClient = useQueryClient();

    const handleCreate = () => {
        navigate("/users/create");
    };

    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const onTaskCheckboxChange = (ev) => {
        const target = ev.target;
        const targetUserId = parseInt(target.value);
        if (target.checked) {
            setSelectedUsers([...selectedUsers, targetUserId]);
        } else {
            setSelectedUsers(selectedUsers.filter((value) => value !== targetUserId));
        }
    };

    const handleBulkDelete = async () => {
        if (!(await confirm(t("Are you sure you want to delete the selected users?")))) return;
        deleteUsers(selectedUsers)
            .then(() => {
                setSelectedUsers([]);
                toast.success("All selected users were deleted.");
            })
            .catch((err) => console.error(err));
    };

    const onDeleteClick = async (userId) => {
        if (!(await confirm(t("Are you sure you want to delete this user?")))) return;
        userDeleteMutation.mutateAsync(userId).then(() => { });
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
            cell: (user) => <BooleanText value={user.mfaEnabled} />,
        },
        {
            header: <>&nbsp;</>,
            cell: (user) => (
                <div style={{ textAlign: "right" }}>
                    <LinkButton href={`/users/${user.id}/edit`}>Edit</LinkButton>
                    <DeleteButton display="icon"
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
                    <CreateButton onClick={handleCreate}>New user</CreateButton>
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

            <PageTitleHeader title={t("Users")} />

            <NativeTable
                columns={columns}
                rows={isLoading ? null : users}
                rowId={(user) => user.id}
                emptyRowsMessage="No users available."
            ></NativeTable>
            {confirmDialog}
        </>
    );
};

export default UsersListPage;
