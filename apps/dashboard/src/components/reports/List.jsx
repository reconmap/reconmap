import { useReportsQuery } from "api/reports.js";
import Breadcrumb from "../ui/Breadcrumb";
import Loading from "../ui/Loading";
import Title from "../ui/Title";
import ReportsTable from "./Table";

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
