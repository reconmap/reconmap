const NativeCheckbox = ({ children, ...props }) => {
    return (
        <div className="control">
            <label className="checkbox">
                <input type="checkbox" {...props} /> {children}
            </label>
        </div>
    );
};

export default NativeCheckbox;
