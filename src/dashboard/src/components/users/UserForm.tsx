import { type ChangeEvent } from "react";
import Form from "components/forms/Form";
import FormActions from "components/forms/FormActions";
import FormField from "components/forms/FormField";
import NativeCheckbox from "components/forms/NativeCheckbox";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import UserRoles from "../../models/UserRoles";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import UserPreferences from "./UserPreferences";

// Plain ASCII letters, spaces, apostrophes, periods and hyphens only
const PERSON_NAME_PATTERN = "[A-Za-z .'\\-]*";
const PERSON_NAME_TITLE = "Only letters, spaces, apostrophes, periods and hyphens are allowed";

// Plain ASCII letters, digits, periods, underscores and hyphens only
const USERNAME_PATTERN = "[A-Za-z0-9._\\-]*";
const USERNAME_TITLE = "Only letters, numbers, periods, underscores and hyphens are allowed";

const UserForm = ({ isEdit = false, user, userSetter: setUser, onFormSubmit, isOwner = false, preferences, onPreferencesChange }: any) => {
    const onFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
        setUser({ ...user, [name]: value });
    };

    return (
        <Form layout="horizontal" onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>

                <FormField
                    label="First name"
                    htmlFor="firstName"
                    control={
                        <NativeInput
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={user.firstName || ""}
                            onChange={onFormChange}
                            pattern={PERSON_NAME_PATTERN}
                            title={PERSON_NAME_TITLE}
                            required
                        />
                    }
                />
                <FormField
                    label="Last name"
                    htmlFor="lastName"
                    control={
                        <NativeInput
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={user.lastName || ""}
                            onChange={onFormChange}
                            pattern={PERSON_NAME_PATTERN}
                            title={PERSON_NAME_TITLE}
                        />
                    }
                />
                <FormField
                    label="Short bio"
                    htmlFor="shortBio"
                    control={
                        <NativeInput
                            type="text"
                            name="shortBio"
                            value={user.shortBio || ""}
                            onChange={onFormChange}
                            placeholder="DevSecOps, or Project Manager"
                        />
                    }
                />

                <FormField
                    label="Username"
                    htmlFor="username"
                    control={
                        <NativeInput
                            type="text"
                            name="username"
                            id="username"
                            value={user.username || ""}
                            onChange={onFormChange}
                            pattern={USERNAME_PATTERN}
                            title={USERNAME_TITLE}
                            autoFocus
                            required
                        />
                    }
                />
                <FormField
                    label="Email"
                    htmlFor="email"
                    control={
                        <NativeInput
                            id="email"
                            name="email"
                            type="email"
                            value={user.email || ""}
                            onChange={onFormChange}
                            required
                        />
                    }
                />

                <FormField
                    label="Role"
                    htmlFor="role"
                    control={
                        <NativeSelect id="role" name="role" onChange={onFormChange} value={user.role} required>
                            {UserRoles.map((role) => (
                                <option key={`role_${role.id}`} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
                <FormField
                    control={
                        <div>
                            <NativeCheckbox name="active" checked={user.active} onChange={onFormChange}>
                                Active
                            </NativeCheckbox>
                            <p className="hint">
                                2FA: {user.mfaEnabled ? "enabled" : "not enabled"}. Users set up 2FA in their account settings.
                            </p>
                        </div>
                    }
                />
            </fieldset>

            {isEdit && preferences && (
                <fieldset>
                    <legend>Preferences</legend>
                    <UserPreferences isOwner={isOwner} values={preferences} onChange={onPreferencesChange} />
                </fieldset>
            )}

            <FormActions>
                <PrimaryButton type="submit">Save</PrimaryButton>
            </FormActions>
        </Form>
    );
};

export default UserForm;
