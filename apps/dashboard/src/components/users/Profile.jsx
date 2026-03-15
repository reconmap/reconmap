import { resetPassword } from "api/requests/users.js";
import { useUserActivity, useUserDeleteMutation, useUserQuery } from "api/users.js";
import NativeButton from "components/form/NativeButton";
import NativeButtonGroup from "components/form/NativeButtonGroup";
import NativeTabs from "components/form/NativeTabs";
import RestrictedComponent from "components/logic/RestrictedComponent";
import BooleanText from "components/ui/BooleanText";
import EmptyField from "components/ui/EmptyField";
import TimestampsSection from "components/ui/TimestampsSection";
import { actionCompletedToast } from "components/ui/toast";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuditLogsTable from "../auditlog/AuditLogsTable";
import UserAvatar from "../badges/UserAvatar";
import UserRoleBadge from "../badges/UserRoleBadge";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import DeleteButton from "../ui/buttons/Delete";
import LinkButton from "../ui/buttons/Link";
import { LastLogin } from "./LastLogin";

const UserProfile = () => {
    const navigate = useNavigate();

    const { userId } = useParams();
    const { data: user, isLoading, isError, error } = useUserQuery(userId);
    const { data: auditLog, isLoadingUserActivity } = useUserActivity(userId);
    const userDeleteMutation = useUserDeleteMutation();

    const [tabIndex, tabIndexSetter] = useState(0);

    const onDeleteButtonClick = (ev) => {
        ev.preventDefault();

        userDeleteMutation.mutate(userId).then(() => {
            navigate("/users");
        });
    };

    const enableMfa = () => {
        enableMfa(userId).then(() => {
            actionCompletedToast("MFA enabled");
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

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/users">Users</Link>
                    <Link>{user.fullName}</Link>
                </Breadcrumb>
                <NativeButtonGroup>
                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                        <LinkButton href={`/users/${user.id}/edit`}>Edit</LinkButton>
                        {!user.mfa_enabled && <NativeButton onClick={enableMfa}>Enable MFA</NativeButton>}
                        <NativeButton onClick={onResetPasswordClick}>Reset password</NativeButton>
                        <DeleteButton onClick={onDeleteButtonClick} />
                    </RestrictedComponent>
                </NativeButtonGroup>
            </div>
            <div>
                <Title
                    type="User profile"
                    title={user.fullName}
                    icon={user.email ? <UserAvatar email={user.email} /> : null}
                />

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

                                        <dt>Timezone</dt>
                                        <dd>{user.timeZone}</dd>

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
                            {!isLoadingUserActivity ? (
                                <AuditLogsTable auditLog={auditLog} hideUserColumns="true" />
                            ) : (
                                <Loading />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfile;
