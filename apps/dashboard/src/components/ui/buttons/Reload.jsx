import NativeButton from "components/form/NativeButton";

const ReloadButton = (props) => (
    <NativeButton
        title="Reload"
        onClick={props.onClick}
        {...props}
        style={{ textAlign: "center", padding: 0, margin: 0 }}
    />
);

export default ReloadButton;
