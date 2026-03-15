import NativeButton from "components/form/NativeButton";
import { useTranslation } from "react-i18next";

const EditButton = (props) => {
    const [t] = useTranslation("common");

    return <NativeButton {...props}>{t("ui.button.edit")}</NativeButton>;
};

export default EditButton;
