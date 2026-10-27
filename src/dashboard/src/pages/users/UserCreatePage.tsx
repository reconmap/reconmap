import { useQueryClient } from "@tanstack/react-query";
import { createUserApi } from "api/requests/users";
import defaultUser from "models/User";
import UserRoles from "models/UserRoles";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import UserForm from "components/users/UserForm";
import { useTranslation } from "react-i18next";

const UserCreatePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ ...defaultUser, role: UserRoles[0].id });
    const queryClient = useQueryClient();

    const handleCreate = async (ev) => {
        ev.preventDefault();

        try {
            const resp = await createUserApi(userData);
            if (resp.ok) {
                navigate("/users/");
                toast.success(`The user "${userData.firstName} ${userData.lastName}" has been created.`);
                queryClient.invalidateQueries({ queryKey: ["users"] });
            } else {
                toast.error("Unable to create user: " + resp.status);
            }
        } catch (err: any) {
            toast.error("Unable to create user: " + (err?.message ?? "Unknown error"));
        }
    };

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("New user")} />

            <UserForm user={userData} userSetter={setUserData} onFormSubmit={handleCreate} />
        </div>
    );
};

export default UserCreatePage;
