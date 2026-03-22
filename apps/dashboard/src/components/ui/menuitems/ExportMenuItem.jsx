import NativeButton from "components/forms/NativeButton.jsx";
import { downloadFromApi } from "services/api.js";

const ExportMenuItem = ({ entity }) => {
    return <NativeButton onClick={() => downloadFromApi("/system/data?entities=" + entity)}>Export</NativeButton>;
};

export default ExportMenuItem;
