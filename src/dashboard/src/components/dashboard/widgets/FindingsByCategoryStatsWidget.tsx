import { useFindingsStatsQuery } from "api/findings";
import { Pie, PieChart } from "recharts";
import DashboardWidget from "./DashboardWidget";

const FindingsByCategoryStatsWidget = ({ projectId = null }: any) => {
    const params = { groupBy: "category" };
    if (null !== projectId) params["projectId"] = projectId;
    const { data: findingsByCategoryStats } = useFindingsStatsQuery(params);

    return (
        <DashboardWidget title="Findings by category">
            {findingsByCategoryStats && findingsByCategoryStats.length > 0 ? (
                <PieChart width={320} height={320}>
                    <Pie
                        data={findingsByCategoryStats}
                        dataKey="total"
                        cx={160}
                        cy={160}
                        labelLine={true}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        fill="#82ca9d"
                        label={({ index }: any) =>
                            `${findingsByCategoryStats[index].category_name} (${findingsByCategoryStats[index].total})`
                        }
                        {...({ labelStyle: { fill: "#ffffff" } } as any)}
                    ></Pie>
                </PieChart>
            ) : (
                <p>No enough data to generate the chart.</p>
            )}
        </DashboardWidget>
    );
};

export default FindingsByCategoryStatsWidget;
