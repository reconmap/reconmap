import { forwardRef } from "react";
import styles from "./NativeInput.module.css";

const NativeInput = forwardRef(({ children: _children, ...props }, ref) => {
    return <input className={`input ${styles.native}`} ref={ref} {...props} />;
});

export default NativeInput;
