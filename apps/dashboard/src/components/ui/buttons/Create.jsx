import { useTranslation } from "react-i18next";
import PrimaryButton from "./Primary";

const CreateButton = ({ onClick, children }) => {
    const [t] = useTranslation("common");

    return <PrimaryButton onClick={onClick}>{children || t("ui.button.create")}</PrimaryButton>;
};

export default CreateButton;
