import LabelledField from "components/form/LabelledField";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import MarkdownEditor from "components/ui/forms/MarkdownEditor";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../ui/buttons/Primary";

const DocumentForm = ({ document, onFormSubmit, documentSetter: setNote, isEditForm = false }) => {
    const [t] = useTranslation();

    const onFormInputChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value;

        setNote({
            ...document,
            [name]: value,
        });
    };

    return (
        <form onSubmit={onFormSubmit}>
            <div>
                <label htmlFor="title">{t("Title")}</label>
                <NativeInput
                    type="text"
                    name="title"
                    id="title"
                    value={document.title || ""}
                    onChange={onFormInputChange}
                    autoFocus
                    required
                />
            </div>

            <div>
                <label htmlFor="content">{t("Content")} (markdown supported)</label>
                <MarkdownEditor
                    id="content"
                    name="content"
                    style={{ width: "100%" }}
                    value={document.content || ""}
                    onChange={onFormInputChange}
                    required
                />
                <br />
            </div>

            <LabelledField
                label="Visibility"
                htmlFor="visibility"
                control={
                    <NativeSelect
                        name="visibility"
                        id="visibility"
                        value={document.visibility}
                        onChange={onFormInputChange}
                        required
                    >
                        <option value="private">{t("Private")}</option>
                        <option value="public">{t("Public")}</option>
                    </NativeSelect>
                }
            />

            <PrimaryButton type="submit">{isEditForm ? t("Update") : t("Create")}</PrimaryButton>
        </form>
    );
};

export default DocumentForm;
