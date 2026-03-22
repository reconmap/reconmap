const NativeSelect = ({ children, ...props }) => {
    return (
        <div className={`select ${props.hasOwnProperty("multiple") ? "is-multiple" : ""}`}>
            <select {...props}>{children}</select>
        </div>
    );
};

export default NativeSelect;
