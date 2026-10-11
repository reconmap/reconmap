import { useTranslation } from "react-i18next";

const EmptyField = () => {
    const [t] = useTranslation();

    return <em>{t("(empty)")}</em>;
};

export default EmptyField;
