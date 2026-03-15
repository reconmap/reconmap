import useDocumentTitle from "hooks/useDocumentTitle";
import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";

const SettingsIndexPage = () => {
    useDocumentTitle("Settings");
    return (
        <div>
            <div className="heading">
                <Breadcrumb />
            </div>
            <Title title="Settings" />

            <p>Click on one of the items on the left.</p>
        </div>
    );
};

export default SettingsIndexPage;
