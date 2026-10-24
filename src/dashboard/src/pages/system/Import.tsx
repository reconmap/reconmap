import PageTitleHeader from "components/ui/PageTitleHeader";
import ImportForm from "components/system/ImportForm";
import { useTranslation } from "react-i18next";

const ImportPage = () => {
    const [t] = useTranslation();
    return (
        <div>
            <PageTitleHeader title={t("Import data")} subHeader={t("System")} />

            <ImportForm />
        </div>
    );
};

export default ImportPage;
