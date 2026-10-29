import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useUserQuery, useUserUpdateMutation } from "api/users";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { toast } from "components/ui/toast";
import UserForm from "components/users/UserForm";
import { useAuth } from "contexts/AuthContext";
import { useTheme } from "hooks/useTheme";
import { useTranslation } from "react-i18next";
import { initialiseUserPreferences } from "services/userPreferences";

const UserEditPage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams() as any;
    const { user: currentUser } = useAuth() as any;
    const { setTheme } = useTheme();
    const { i18n } = useTranslation();

    const { data: user } = useUserQuery(userId);
    const [userEdits, setClientUser] = useState<any>(null);
    const [preferencesEdits, setPreferences] = useState<any>(null);
    const updateUserMutation = useUserUpdateMutation(userId);

    const clientUser = userEdits ?? user;
    const savedPreferences = user && {
        language: user.locale || "en",
        theme: initialiseUserPreferences(user)["dashboard.theme"],
        timezone: user.timezone || "UTC",
    };
    const preferences = preferencesEdits ?? savedPreferences;

    // Preferences belong to the user they describe: only that user can change them.
    const isOwner = currentUser?.id === user?.id;

    const onPreferencesChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setPreferences({ ...preferences, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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
                    toast.success(`The user "${clientUser.firstName} ${clientUser.lastName}" has been updated.`);
                },
                onError: (err) => {
                    toast.error("Unable to update user: " + (err.message ?? "Unknown error"));
                },
            },
        );
    };

    if (!clientUser || !preferences) return <PageSkeleton />;

    return (
        <div>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                </Breadcrumb>
            </div>

            <PageTitleHeader title={t("Edit user")} />

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

export default UserEditPage;
