import NativeButton from "components/forms/NativeButton";
import { useNavigate } from "react-router-dom";

const SecondaryButton = ({ onClick, children, to = "", disabled = false, external = false, tooltip, ...props }: any) => {
    const navigate = useNavigate();
    const handleOpen = () => {
        if (external) {
            window.open(to, "_blank");
        } else {
            navigate(to);
        }
    };

    return (
        <NativeButton {...props} title={tooltip} onClick={onClick || handleOpen} disabled={disabled}>
            {children}
        </NativeButton>
    );
};

export default SecondaryButton;
