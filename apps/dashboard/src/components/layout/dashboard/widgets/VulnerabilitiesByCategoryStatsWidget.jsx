import { useVulnerabilitiesStatsQuery } from "api/vulnerabilities.js";
import { Pie, PieChart } from "recharts";
import DashboardWidget from "./Widget";

const VulnerabilitiesByCategoryStatsWidget = ({ projectId = null }) => {
    const params = { groupBy: "category" };
    if (null !== projectId) params["projectId"] = projectId;
    const { data: vulnerabilitiesByCategoryStats } = useVulnerabilitiesStatsQuery(params);

    return (
        <DashboardWidget title="Vulnerabilities by category">
            {vulnerabilitiesByCategoryStats && vulnerabilitiesByCategoryStats.length > 0 ? (
                <PieChart width={320} height={320}>
                    <Pie
                        data={vulnerabilitiesByCategoryStats}
                        dataKey="total"
                        cx={160}
                        cy={160}
                        labelLine={true}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        fill="#82ca9d"
                        label={({ index }) =>
                            `${vulnerabilitiesByCategoryStats[index].category_name} (${vulnerabilitiesByCategoryStats[index].total})`
                        }
                        labelStyle={{ fill: "#ffffff" }}
                    ></Pie>
                </PieChart>
            ) : (
                <p>No enough data to generate the chart.</p>
            )}
        </DashboardWidget>
    );
};

export default VulnerabilitiesByCategoryStatsWidget;
