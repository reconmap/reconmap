import { useQueryClient } from "@tanstack/react-query";
import { createUserApi } from "api/requests/users.js";
import defaultUser from "models/User";
import UserRoles from "models/UserRoles.js";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";
import { actionCompletedToast, errorToast } from "../ui/toast";
import UserForm from "./Form";

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ ...defaultUser, role: UserRoles[0].id });
    const queryClient = useQueryClient();

    const handleCreate = async (ev) => {
        ev.preventDefault();

        await createUserApi(userData).then((resp) => {
            if (resp.ok) {
                navigate("/users/");
                actionCompletedToast(`The user "${userData.firstName} ${userData.lastName}" has been created.`);
                queryClient.invalidateQueries({ queryKey: ["users"] });
            } else {
                errorToast("Unable to create user: " + resp.status);
            }
        });
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <Title title="New user details" />

            <UserForm user={userData} userSetter={setUserData} onFormSubmit={handleCreate} />
        </div>
    );
};

export default CreateUserPage;
