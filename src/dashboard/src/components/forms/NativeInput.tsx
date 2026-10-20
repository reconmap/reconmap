import { forwardRef } from "react";
import styles from "./NativeInput.module.css";

const NativeInput = forwardRef<any, any>(({ children: _children, ...props }: any, ref) => {
    return <input className={`input ${styles.native}`} ref={ref} {...props} />;
});

NativeInput.displayName = "NativeInput";

export default NativeInput;
