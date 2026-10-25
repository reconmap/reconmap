import { useTranslation } from "react-i18next";
import PrimaryButton from "./PrimaryButton";

const CreateButton = ({ onClick, children }: any) => {
    const [t] = useTranslation("common");

    return <PrimaryButton onClick={onClick}>{children || t("ui.button.new")}</PrimaryButton>;
};

export default CreateButton;
