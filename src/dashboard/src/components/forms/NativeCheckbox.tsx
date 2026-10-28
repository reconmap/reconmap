const NativeCheckbox = ({ children, ...props }: any) => {
    return (
        <label className="checkbox">
            <input type="checkbox" {...props} /> {children}
        </label>
    );
};

export default NativeCheckbox;
