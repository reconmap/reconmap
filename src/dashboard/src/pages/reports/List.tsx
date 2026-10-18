import { useQueryClient } from "@tanstack/react-query";
import { useReportsQuery } from "api/reports";
import Breadcrumb from "components/ui/Breadcrumb";
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
            <ReportsTable reports={isLoading ? null : reports} includeProjectColumn={true} />
        </>
    );
};

export default ReportsList;
