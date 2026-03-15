import { forwardRef } from "react";
import styles from "./NativeInput.module.css";

const NativeInput = forwardRef(({ children, ...props }, ref) => {
    return <input className={`input ${styles.native}`} ref={ref} {...props} />;
});

export default NativeInput;
