import { enableMfaApi, resetPassword } from "api/requests/users";
import { useUserActivity, useUserDeleteMutation, useUserQuery } from "api/users";
import AuditLogsTable from "components/auditlog/AuditLogsTable";
import UserRoleBadge from "components/badges/UserRoleBadge";
import NativeButton from "components/forms/NativeButton";
import NativeButtonGroup from "components/forms/NativeButtonGroup";
import NativeTabs from "components/forms/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import BooleanText from "components/ui/BooleanText";
import PageSkeleton from "components/ui/PageSkeleton";
import Breadcrumb from "components/ui/Breadcrumb";
import EmptyField from "components/ui/EmptyField";
import TimestampsSection from "components/ui/TimestampsSection";
import PageTitleHeader from "components/ui/PageTitleHeader";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import { actionCompletedToast } from "components/ui/toast";
import { errorToast } from "components/ui/toast";
import { LastLogin } from "components/users/LastLogin";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";

const UserProfilePage = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();

    const { userId } = useParams() as any;
    const { data: user, isLoading, isError, error } = useUserQuery(userId);
    const { data: auditLog } = useUserActivity(userId) as any;
    const userDeleteMutation = useUserDeleteMutation();

    const [tabIndex, tabIndexSetter] = useState(0);

    const onDeleteButtonClick = (ev) => {
        ev.preventDefault();

        userDeleteMutation.mutateAsync(userId).then(() => {
            navigate("/users");
        });
    };

    const enableMfa = () => {
        enableMfaApi(userId).then((res) => {
            if (!res.ok) {
                errorToast(`MFA could not be enabled (status ${res.status})`);
                return;
            }
            actionCompletedToast("The user will be asked to set up 2FA at their next login");
        });
    };

    const onResetPasswordClick = () => {
        resetPassword(userId).then(() => {
            actionCompletedToast("Password reset");
        });
    };

    if (isError) {
        return <>{error.message}</>;
    }

    if (isLoading) return <PageSkeleton />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                    <Link to="#">{user.fullName}</Link>
                </Breadcrumb>
                <NativeButtonGroup>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/users/${user.id}/edit`}>Edit</LinkButton>
                        {!user.mfaEnabled && <NativeButton onClick={enableMfa}>Enable MFA</NativeButton>}
                        <NativeButton onClick={onResetPasswordClick}>Reset password</NativeButton>
                        <DeleteButton onClick={onDeleteButtonClick} />
                    </RestrictedComponent>
                </NativeButtonGroup>
            </div>
            <div>
                <PageTitleHeader title={user.fullName} subHeader={t("User profile")} />

                <NativeTabs labels={["Details", "Activity"]} tabIndex={tabIndex} tabIndexSetter={tabIndexSetter} />

                <div>
                    {0 === tabIndex && (
                        <div>
                            <div className="grid grid-two content">
                                <div>
                                    <h4>Properties</h4>
                                    <dl>
                                        <dt>Short bio</dt>
                                        <dd>{user.shortBio ? user.shortBio : <EmptyField />}</dd>

                                        <dt>Role</dt>
                                        <dd>
                                            <UserRoleBadge role={user.role} />
                                            <br />
                                        </dd>

                                        <dt>Active?</dt>
                                        <dd>
                                            <BooleanText value={user.active} />
                                        </dd>

                                        <dt>2FA enabled?</dt>
                                        <dd>
                                            <BooleanText value={user.mfaEnabled} />
                                        </dd>
                                    </dl>
                                </div>

                                <div>
                                    <TimestampsSection entity={user} />
                                    <dl>
                                        <dt>Last login</dt>
                                        <dd>
                                            <LastLogin user={user} />
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    )}
                    {1 === tabIndex && (
                        <div>
                            <h4>
                                Activity (<Link to="/auditlog">view full audit log</Link>)
                            </h4>
                            <AuditLogsTable auditLog={auditLog ?? null} hideUserColumns="true" />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;
