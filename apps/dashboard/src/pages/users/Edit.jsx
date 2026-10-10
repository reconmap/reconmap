import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserQuery, useUserUpdateMutation } from "api/users.js";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import { actionCompletedToast } from "components/ui/toast";
import UserForm from "components/users/Form";
import { useAuth } from "contexts/AuthContext";
import { useTheme } from "hooks/useTheme";
import { useTranslation } from "react-i18next";
import { initialiseUserPreferences } from "services/userPreferences";

const EditUserPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [clientUser, setClientUser] = useState(null);
    const [preferences, setPreferences] = useState(null);

    const { user: currentUser } = useAuth();
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    const { data: user } = useUserQuery(userId);
    const updateUserMutation = useUserUpdateMutation(userId);

    // Preferences belong to the user they describe: only that user can change them.
    const isOwner = currentUser?.id === user?.id;

    useEffect(() => {
        if (user) {
            setClientUser(user);
            setPreferences({
                language: user.locale || "en",
                theme: initialiseUserPreferences(user)["dashboard.theme"],
                timezone: user.timezone || "UTC",
            });
        }
    }, [user]);

    const onPreferencesChange = (ev) => {
        setPreferences({ ...preferences, [ev.target.name]: ev.target.value });
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();

        const ownerFields = isOwner
            ? {
                  locale: preferences.language,
                  timezone: preferences.timezone,
                  preferences: { ...initialiseUserPreferences(user), "dashboard.theme": preferences.theme },
              }
            : undefined;

        updateUserMutation.mutate(
            { user: clientUser, ownerFields },
            {
                onSuccess: () => {
                    if (isOwner) {
                        setTheme(preferences.theme);
                        i18n.changeLanguage(preferences.language);
                    }
                    navigate(`/users/${userId}`);
                    actionCompletedToast(`The user "${clientUser.firstName} ${clientUser.lastName}" has been updated.`);
                },
            },
        );
    };

    if (!clientUser || !preferences) return <Loading />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <Title title="User details" />

            <UserForm
                isEdit={true}
                user={clientUser}
                userSetter={setClientUser}
                onFormSubmit={handleSubmit}
                isOwner={isOwner}
                preferences={preferences}
                onPreferencesChange={onPreferencesChange}
            />
        </div>
    );
};

export default EditUserPage;
