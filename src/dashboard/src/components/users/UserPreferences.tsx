import FormField from "components/forms/FormField";
import NativeSelect from "components/forms/NativeSelect";
import EmptyField from "components/ui/EmptyField";
import { ThemeList } from "models/themes";
import { LanguageList } from "translations/LanguageList";

const timezones = Intl.supportedValuesOf("timeZone");

const languageName = (id) => LanguageList.find((lang) => lang.id === id)?.name ?? id;
const themeName = (id) => ThemeList.find((theme) => theme.id === id)?.name ?? id;

// Language, theme and timezone are personal: everyone can see them, only the owner of the profile can change them.
const UserPreferences = ({ isOwner, values, onChange }: any) => {
    if (!isOwner) {
        return (
            <>
                <FormField
                    label="Language"
                    control={values.language ? <span>{languageName(values.language)}</span> : <EmptyField />}
                />
                <FormField label="Theme" control={<span>{themeName(values.theme)}</span>} />
                <FormField
                    label="Timezone"
                    control={values.timezone ? <span>{values.timezone}</span> : <EmptyField />}
                />
                <p className="hint">Only this user can change their preferences.</p>
            </>
        );
    }

    return (
        <>
            <FormField
                label="Language"
                htmlFor="language"
                control={
                    <NativeSelect id="language" name="language" value={values.language} onChange={onChange}>
                        {LanguageList.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />
            <FormField
                label="Theme"
                htmlFor="theme"
                control={
                    <NativeSelect id="theme" name="theme" value={values.theme} onChange={onChange}>
                        {ThemeList.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                                {theme.name}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />
            <FormField
                label="Timezone"
                htmlFor="timezone"
                control={
                    <NativeSelect id="timezone" name="timezone" value={values.timezone} onChange={onChange}>
                        {timezones.map((timezone) => (
                            <option key={timezone} value={timezone}>
                                {timezone}
                            </option>
                        ))}
                    </NativeSelect>
                }
            />
        </>
    );
};

export default UserPreferences;
