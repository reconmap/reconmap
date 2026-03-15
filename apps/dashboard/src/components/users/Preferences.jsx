import { requestUserPatch } from "api/requests/users.js";
import { useUserQuery } from "api/users.js";
import NativeSelect from "components/form/NativeSelect";
import PrimaryButton from "components/ui/buttons/Primary";
import { actionCompletedToast } from "components/ui/toast";
import { useAuth } from "contexts/AuthContext";
import CountriesTimezones from "countries-and-timezones";
import { useTheme } from "hooks/useTheme";
import { ThemeList } from "models/themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { initialiseUserPreferences } from "services/userPreferences";
import { LanguageList } from "translations/LanguageList";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";

const UserPreferences = () => {
    const { i18n } = useTranslation();

    const { user } = useAuth();

    const { data: userData } = useUserQuery(user.id);

    const timezones = CountriesTimezones.getAllTimezones();
    const timezoneKeys = Object.keys(timezones).sort();

    const { setTheme } = useTheme();

    const [formValues, setFormValues] = useState(null);

    const updateFormValues = (ev) => {
        setFormValues({ ...formValues, [ev.target.name]: ev.target.value });
    };

    const onFormSubmit = (ev) => {
        ev.preventDefault();

        user.preferences = {
            ...initialiseUserPreferences(user),
            "web-client.theme": formValues.theme,
            "web-client.language": formValues.language,
        };

        requestUserPatch(user.id, {
            timezone: formValues.timezone,
            preferences: user.preferences,
        })
            .then(() => {
                setTheme(formValues.theme);
                i18n.changeLanguage(formValues.language);

                actionCompletedToast("Your preferences have been saved.");
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        if (userData && userData.preferences) {
            setFormValues({
                timezone: userData.timezone,
                theme: userData.preferences["web-client.theme"],
                language: userData.preferences["web-client.language"],
            });
        }
    }, [userData]);

    if (!userData) {
        return <>Loading&hellip;</>;
    }

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>
            <Title type="User" title="Preferences" />
            <form onSubmit={onFormSubmit}>
                <div className="field">
                    <label className="label">Language</label>
                    <div className="control">
                        <NativeSelect
                            className="input"
                            name="language"
                            onChange={updateFormValues}
                            defaultValue={
                                userData.preferences ? userData.preferences["web-client.language"] : LanguageList[0].id
                            }
                        >
                            {LanguageList.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>

                <div className="field">
                    <label className="label">Theme</label>
                    <div className="control">
                        <NativeSelect
                            name="theme"
                            onChange={updateFormValues}
                            defaultValue={
                                userData.preferences ? userData.preferences["web-client.theme"] : ThemeList[0].id
                            }
                        >
                            {ThemeList.map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Timezone</label>
                    <div className="control">
                        <NativeSelect name="timezone" onChange={updateFormValues} defaultValue={userData.timezone}>
                            {timezoneKeys.map((key, index) => (
                                <option key={index} value={timezones[key].name}>
                                    {timezones[key].name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                </div>

                <div className="field">
                    <div className="control">
                        <PrimaryButton type="submit">Save</PrimaryButton>
                    </div>
                </div>
            </form>
        </>
    );
};

export default UserPreferences;
