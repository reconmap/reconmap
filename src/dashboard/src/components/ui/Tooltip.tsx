import CssIcon from "./CssIcon";
import "./Tooltip.module.css";

const Tooltip = ({ text, position = "top" }: any) => {
    return (
        <span data-tooltip={text} data-tooltip-position={position}>
            <CssIcon name="question-circle" />
        </span>
    );
};

export default Tooltip;
