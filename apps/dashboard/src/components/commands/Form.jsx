import LabelledField from "components/form/LabelledField";
import NativeInput from "components/form/NativeInput";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../ui/buttons/Primary";

const CommandForm = ({ isEditForm = false, onFormSubmit, command, commandSetter: setCommand }) => {
    const [t] = useTranslation();

    const onFormChange = (ev) => {
        const target = ev.target;
        let name = target.name;
        let value = target.value;
        if ("tags" === name) {
            value = JSON.stringify(value.split(","));
        }
        setCommand({ ...command, [name]: value });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <fieldset>
                <legend>Basic information</legend>
                <LabelledField
                    label={t("Name")}
                    control={
                        <NativeInput
                            type="text"
                            name="name"
                            onChange={onFormChange}
                            defaultValue={command.name || ""}
                            required
                            autoFocus
                        />
                    }
                />

                <LabelledField
                    label={t("Description")}
                    control={
                        <MarkdownEditor
                            name="description"
                            onChange={onFormChange}
                            defaultValue={command.description || ""}
                            required
                        />
                    }
                />

                <LabelledField
                    label={t("Tags")}
                    control={
                        <NativeInput
                            type="text"
                            name="tags"
                            onChange={onFormChange}
                            defaultValue={command.tags ? JSON.parse(command.tags).join(",") : ""}
                        />
                    }
                />
                <label>
                    More information URL
                    <NativeInput
                        type="url"
                        name="more_info_url"
                        onChange={onFormChange}
                        placeholder="https://"
                        defaultValue={command.more_info_url || ""}
                    />
                </label>
            </fieldset>

            <PrimaryButton type="submit">{isEditForm ? "Save" : "Add"}</PrimaryButton>
        </form>
    );
};

export default CommandForm;
