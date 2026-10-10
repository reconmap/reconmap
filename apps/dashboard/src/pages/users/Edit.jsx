import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserQuery, useUserUpdateMutation } from "api/users.js";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import UserForm from "components/users/Form";

const EditUserPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [clientUser, setClientUser] = useState(null);

    const { data: user } = useUserQuery(userId);
    const updateUserMutation = useUserUpdateMutation(userId);

    useEffect(() => {
        if (user) setClientUser(user);
    }, [user]);

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        updateUserMutation.mutate(clientUser, {
            onSuccess: () => {
                navigate(`/users/${userId}`);
                actionCompletedToast(`The user "${clientUser.firstName} ${clientUser.lastName}" has been updated.`);
            },
        });
    };

    if (!clientUser) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <Title title="User details" />

            <UserForm isEdit={true} user={clientUser} userSetter={setClientUser} onFormSubmit={handleSubmit} />
        </div>
    );
};

export default EditUserPage;
