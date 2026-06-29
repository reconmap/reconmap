import { useQueryClient } from "@tanstack/react-query";
import { useReportsQuery } from "api/reports.js";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import ReportsTable from "components/reports/Table";
import { useSseMessage } from "contexts/SseContext";

const ReportsList = () => {
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
            <Title title="Reports" />
            {isLoading ? <Loading /> : <ReportsTable reports={reports} includeProjectColumn={true} />}
        </>
    );
};

export default ReportsList;
