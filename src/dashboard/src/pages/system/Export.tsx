import PageTitleHeader from "components/ui/PageTitleHeader";
import ExportForm from "components/system/ExportForm";
import { useTranslation } from "react-i18next";

const ExportPage = () => {
    const [t] = useTranslation();
    return (
        <div>
            <PageTitleHeader title={t("Export data")} subHeader={t("System")} />

            <ExportForm />
        </div>
    );
};

export default ExportPage;
