import { useTranslation } from "react-i18next";

const DeleteButton = (props) => {
    const [t] = useTranslation("common");

    return (
        <button className="button is-danger" onClick={props.onClick} {...props}>
            {props.children || t("ui.button.delete")}
        </button>
    );
};

export default DeleteButton;
