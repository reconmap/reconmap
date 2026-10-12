import NativeButton from "components/forms/NativeButton";
import { downloadFromApi } from "services/api";

const ExportMenuItem = ({ entity }: any) => {
    return <NativeButton onClick={() => downloadFromApi("/system/data?entities=" + entity)}>Export</NativeButton>;
};

export default ExportMenuItem;
