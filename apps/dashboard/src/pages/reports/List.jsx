import { useReportsQuery } from "api/reports.js";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading";
import Title from "components/ui/Title";
import ReportsTable from "components/reports/Table";

const ReportsList = () => {
    const { data: reports, isLoading } = useReportsQuery({ isTemplate: false });

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
