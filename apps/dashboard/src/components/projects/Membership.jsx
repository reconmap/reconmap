import { useProjectQuery, useProjectUsersQuery } from "api/projects.js";
import { requestProjectMemberPost, requestProjectUserDelete } from "api/requests/projects.js";
import { useUsersQuery } from "api/users.js";
import UserRoleBadge from "components/badges/UserRoleBadge";
import NativeSelect from "components/form/NativeSelect";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import Loading from "components/ui/Loading.jsx";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import Title from "components/ui/Title";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UserAvatar from "../badges/UserAvatar";
import Breadcrumb from "../ui/Breadcrumb";
import PrimaryButton from "../ui/buttons/Primary";
import UserLink from "../users/Link";

const ProjectMembership = () => {
    const { projectId } = useParams();
    const { data: users } = useUsersQuery();
    const { data: members, isLoading, refetch } = useProjectUsersQuery(projectId);
    const { data: savedProject } = useProjectQuery(projectId);
    const [availableUsers, setAvailableUsers] = useState([]);

    const handleOnClick = (ev) => {
        ev.preventDefault();

        const userId = document.getElementById("userId").value;
        requestProjectMemberPost(projectId, parseInt(userId)).then(() => {
            refetch();
        });
    };

    const onDeleteClick = (member) => {
        requestProjectUserDelete(projectId, member.id).then(() => {
            refetch();
        });
    };

    useEffect(() => {
        if (members && users && users.length > 0) {
            const memberIds = members.reduce((list, user) => [...list, user.userId], []);

            setAvailableUsers(users.filter((user) => !memberIds.includes(user.id)));
        }
    }, [members, users]);

    if (isLoading) return <Loading />;

    const columns = [
        {
            header: "",
            cell: (member) => (<UserAvatar email={member.email} />)
        },
        {
            header: "Name",
            cell: (member) => <UserLink userId={member.userId}>{member.fullName}</UserLink>
        },
        {
            header: "Role",
            cell: (member) => <UserRoleBadge role={member.role} />
        },
        {
            header: "",
            cell: (member) => <DeleteIconButton onClick={() => onDeleteClick(member)} />
        }
    ];

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/projects">Projects</Link>
                    {savedProject && <Link to={`/projects/${savedProject.id}`}>{savedProject.name}</Link>}
                    <Link to={`/projects/${projectId}/membership`}>Membership</Link>
                </Breadcrumb>
            </div>

            <Title title="Project membership" />

            {availableUsers.length > 0 ? (
                <form>
                    <label>
                        <h4 className="title is-4">Select user</h4>
                        <NativeSelect id="userId">
                            {availableUsers &&
                                availableUsers.map((user, index) => (
                                    <option key={index} value={user.id}>
                                        {user.fullName}
                                    </option>
                                ))}
                        </NativeSelect>
                    </label>
                    <PrimaryButton onClick={handleOnClick}>Add as member</PrimaryButton>
                </form>
            ) : (
                <div status="info">All users have been added to the project.</div>
            )}

            <NativeTable rows={members} rowId={member => member.id} columns={columns}>

            </NativeTable>
        </div>
    );
};

export default ProjectMembership;
