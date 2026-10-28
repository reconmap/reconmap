import CssIcon from "components/ui/CssIcon";
import { useTranslation } from "react-i18next";

type DeleteButtonDisplay = "text" | "icon" | "icon-text";

const DeleteButton = ({ display = "text", className, children, ...props }: { display?: DeleteButtonDisplay } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const [t] = useTranslation("common");
    const label = children || t("ui.button.delete");

    return (
        <button
            type="button"
            className={`button is-danger${display === "icon" ? " is-outlined" : ""}${className ? ` ${className}` : ""}`}
            aria-label={display === "icon" ? t("ui.button.delete") : undefined}
            {...props}>
            {display !== "text" && <CssIcon name="trash" />}
            {display !== "icon" && label}
        </button>
    );
};

export default DeleteButton;
