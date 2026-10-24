import { useQueryClient } from "@tanstack/react-query";
import { useReportsQuery } from "api/reports";
import Breadcrumb from "components/ui/Breadcrumb";
import PageTitleHeader from "components/ui/PageTitleHeader";
import ReportsTable from "components/reports/Table";
import { useSseMessage } from "contexts/SseContext";
import { useTranslation } from "react-i18next";

const ReportsList = () => {
    const [t] = useTranslation();
    const queryClient = useQueryClient();
    const { data: reports, isLoading } = useReportsQuery({ isTemplate: false });

    useSseMessage(() => {
        queryClient.invalidateQueries({ queryKey: ["reports"] });
    });

    return (
        <>
            <div className="heading">
                <Breadcrumb />
            </div>
            <PageTitleHeader title={t("Reports")} />
            <ReportsTable reports={isLoading ? null : reports} includeProjectColumn={true} />
        </>
    );
};

export default ReportsList;
