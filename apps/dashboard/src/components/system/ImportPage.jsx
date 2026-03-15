import Title from "../ui/Title";
import ImportForm from "./ImportForm";

const ImportPage = () => {
    return (
        <div>
            <Title type="System" title="Data Import" />

            <ImportForm />
        </div>
    );
};

export default ImportPage;
