import { useTranslation } from "react-i18next";
import PageTitleHeader from "components/ui/PageTitleHeader";

const PageNotFound = () => {
    const [t] = useTranslation();

    return (
        <>
            <PageTitleHeader title={t("Page not found")} />

            <div className="content">
                <p>There is nothing at this address. Please navigate to another place.</p>
            </div>
        </>
    );
};

export default PageNotFound;
