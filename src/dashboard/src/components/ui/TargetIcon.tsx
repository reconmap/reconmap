import type { CSSProperties } from "react";

const TargetIcon = ({ style }: { style?: CSSProperties }) => {
    return (
        <span aria-hidden="true" style={style}>
            🎯
        </span>
    );
};

export default TargetIcon;
