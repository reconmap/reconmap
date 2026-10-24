import PageTitleHeader from "components/ui/PageTitleHeader";
import ImportForm from "components/system/ImportForm";

const ImportPage = () => {
    return (
        <div>
            <PageTitleHeader title="Data Import" subHeader="System" />

            <ImportForm />
        </div>
    );
};

export default ImportPage;
