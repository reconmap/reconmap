const NativeTextArea = ({ children, ...props }: any) => {
    return (
        <textarea className="textarea" {...props}>
            {children}
        </textarea>
    );
};

export default NativeTextArea;
