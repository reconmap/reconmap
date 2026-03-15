import Breadcrumb from "../ui/Breadcrumb";
import Title from "../ui/Title";

const SystemIndexPage = () => {
    return (
        <div>
            <div className="heading">
                <Breadcrumb />
            </div>
            <Title title="System" />

            <p>Click on one of the items on the left.</p>
        </div>
    );
};

export default SystemIndexPage;
