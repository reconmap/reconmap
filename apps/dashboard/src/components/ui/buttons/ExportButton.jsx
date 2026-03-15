import NativeButton from "components/form/NativeButton.jsx";
import { downloadFromApi } from "services/api.js";

const ExportButton = ({ entity, ...props }) => {
    return (
        <NativeButton onClick={() => downloadFromApi("/system/data?entities=" + entity)} {...props}>
            Export
        </NativeButton>
    );
};

export default ExportButton;
