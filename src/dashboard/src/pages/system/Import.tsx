import Title from "components/ui/Title";
import ImportForm from "components/system/ImportForm";

const ImportPage = () => {
    return (
        <div>
            <Title type="System" title="Data Import" />

            <ImportForm />
        </div>
    );
};

export default ImportPage;
