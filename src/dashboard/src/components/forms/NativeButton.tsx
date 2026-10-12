import styles from "./NativeButton.module.css";

const NativeButton = ({ children, ...props }: any) => {
    return (
        <button className={`button ${styles.native}`} {...props}>
            {children}
        </button>
    );
};

export default NativeButton;
