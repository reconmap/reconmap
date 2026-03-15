import NativeButton from "components/form/NativeButton.jsx";
import { useNavigate } from "react-router-dom";

const SecondaryButton = ({ onClick, children, to = "", disabled = false, external = false, tooltip, ...props }) => {
    const navigate = useNavigate();
    const handleOpen = () => {
        external ? window.open(to, "_blank") : navigate(to);
    };

    return (
        <NativeButton {...props} title={tooltip} onClick={onClick || handleOpen} disabled={disabled}>
            {children}
        </NativeButton>
    );
};

export default SecondaryButton;
