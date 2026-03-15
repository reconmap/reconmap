import { getUser, updateUser } from "api/requests/users.js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import { actionCompletedToast } from "../ui/toast";
import UserForm from "./Form";

const EditUserPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [clientUser, setClientUser] = useState(null);

    const handleCreate = async (ev) => {
        ev.preventDefault();

        updateUser(clientUser).then(() => {
            navigate(`/users/${userId}`);
            actionCompletedToast(`The user "${clientUser.fullName}" has been updated.`);
        });
    };

    useEffect(() => {
        async function fetchUser() {
            const user = await getUser(userId);
            setClientUser(await user.json());
        }
        fetchUser();
    }, []);

    if (!clientUser) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <Title title="User details" />

            <UserForm isEdit={true} user={clientUser} userSetter={setClientUser} onFormSubmit={handleCreate} />
        </div>
    );
};

export default EditUserPage;
