import NativeButton from "components/forms/NativeButton";
import { downloadFromApi } from "services/api";

const ExportButton = ({ entity, ...props }: any) => {
    return (
        <NativeButton onClick={() => downloadFromApi("/system/data?entities=" + entity)} {...props}>
            Export
        </NativeButton>
    );
};

export default ExportButton;
