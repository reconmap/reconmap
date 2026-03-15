import { useVulnerabilitiesStatsQuery } from "api/vulnerabilities.js";
import { Cell, Pie, PieChart } from "recharts";
import DashboardWidget from "./Widget";

const RADIAN = Math.PI / 180;

const RISKS = {
    none: { label: "None", color: "var(--color-accent-1)" },
    low: { label: "Low", color: "var(--color-accent-2)" },
    medium: { label: "Medium", color: "var(--color-accent-3)" },
    high: { label: "High", color: "var(--color-accent-4)" },
    critical: { label: "Critical", color: "var(--color-accent-5)" },
};

const VulnerabilitiesByRiskStatsWidget = ({ projectId = null }) => {
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
                {`${RISKS[vulnerabilitiesByRiskStats[index].risk].label} (${vulnerabilitiesByRiskStats[index].total})`}
            </text>
        );
    };

    const params = { groupBy: "risk" };
    if (null !== projectId) params["projectId"] = projectId;
    const { data: vulnerabilitiesByRiskStats, isLoading, error, isError } = useVulnerabilitiesStatsQuery(params);

    if (isLoading) return <p>Loading&hellip;</p>;
    if (isError) return <p>Error loading vulnerabilities stats: {error.message}</p>;

    return (
        <DashboardWidget title="Vulnerabilities by risk">
            {vulnerabilitiesByRiskStats && vulnerabilitiesByRiskStats.length > 0 ? (
                <PieChart width={400} height={320}>
                    <Pie
                        data={vulnerabilitiesByRiskStats}
                        dataKey="total"
                        cx={160}
                        cy={160}
                        labelLine={false}
                        outerRadius={100}
                        strokeOpacity="0"
                        fill="#8884d8"
                        label={renderCustomLabel}
                    >
                        {vulnerabilitiesByRiskStats &&
                            vulnerabilitiesByRiskStats.map((entry, index) => (
                                <Cell key={index} fill={RISKS[entry.risk]?.color} />
                            ))}
                    </Pie>
                </PieChart>
            ) : (
                <p>No enough data to generate the chart.</p>
            )}
        </DashboardWidget>
    );
};

export default VulnerabilitiesByRiskStatsWidget;
