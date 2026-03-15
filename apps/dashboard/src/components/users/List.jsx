import { useQueryClient } from "@tanstack/react-query";
import { deleteUsers } from "api/requests/users.js";
import { useUserDeleteMutation, useUsersQuery } from "api/users.js";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import RestrictedComponent from "components/logic/RestrictedComponent";
import BooleanText from "components/ui/BooleanText";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ExportMenuItem from "components/ui/menuitems/ExportMenuItem";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
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
            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th style={{ width: "32px" }}>&nbsp;</th>
                        <th style={{ width: "64px" }}>&nbsp;</th>
                        <th>Full name</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Active?</th>
                        <th>Last login time</th>
                        <th>2FA enabled?</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <LoadingTableRow numColumns={8} />
                    ) : (
                        <>
                            {null !== users && 0 === users.length && <NoResultsTableRow numColumns={8} />}
                            {null !== users &&
                                0 !== users.length &&
                                users.map((user, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                value={user.id}
                                                onChange={onTaskCheckboxChange}
                                                checked={selectedUsers.includes(user.id)}
                                            />
                                        </td>
                                        <td>
                                            <UserAvatar email={user.email} />
                                        </td>
                                        <td>
                                            <Link to={`/users/${user.id}`}>{user.fullName}</Link>
                                        </td>
                                        <td>
                                            <UserLink userId={user.id}>{user.username}</UserLink>
                                        </td>
                                        <td>
                                            <UserRoleBadge role={user.role} />
                                        </td>
                                        <td>
                                            <BooleanText value={user.active} />
                                        </td>
                                        <td>
                                            <LastLogin user={user} />{" "}
                                        </td>
                                        <td>
                                            <BooleanText value={user.mfa_enabled} />
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <LinkButton href={`/users/${user.id}/edit`}>Edit</LinkButton>
                                            <DeleteIconButton
                                                onClick={() => onDeleteClick(user.id)}
                                                disabled={parseInt(user.id) === loggedInUser.id ? "disabled" : ""}
                                            />
                                        </td>
                                    </tr>
                                ))}
                        </>
                    )}
                </tbody>
            </table>
        </>
    );
};

export default UsersList;
