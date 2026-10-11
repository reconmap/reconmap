const NativeTextArea = ({ children, ...props }) => {
    return (
        <textarea className="textarea" {...props}>
            {children}
        </textarea>
    );
};

export default NativeTextArea;
