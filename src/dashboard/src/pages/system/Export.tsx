import PageTitleHeader from "components/ui/PageTitleHeader";
import ExportForm from "components/system/ExportForm";

const ExportPage = () => {
    return (
        <div>
            <PageTitleHeader title="Data Export" subHeader="System" />

            <ExportForm />
        </div>
    );
};

export default ExportPage;
