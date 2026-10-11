import CssIcon from "./CssIcon.jsx";
import "./Tooltip.module.css";

const Tooltip = ({ text, position = "top" }) => {
    return (
        <span data-tooltip={text} data-tooltip-position={position}>
            <CssIcon name="question-circle" />
        </span>
    );
};

export default Tooltip;
