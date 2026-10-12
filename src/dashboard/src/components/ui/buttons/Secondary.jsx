import NativeButton from "components/forms/NativeButton.jsx";
import { useNavigate } from "react-router-dom";

const SecondaryButton = ({ onClick, children, to = "", disabled = false, external = false, tooltip, ...props }) => {
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
