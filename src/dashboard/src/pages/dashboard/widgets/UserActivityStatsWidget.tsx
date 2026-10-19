import { useAuditLogStatsQuery } from "api/auditlog";
import DashboardWidget from "./Widget";
import "./UserActivityStatsWidget.css";

const WEEKS = 20;
const CELL = 14;
const GAP = 3;
const LEVELS = 4;

interface DailySummary {
    logDate: string;
    total: number;
}

const toKey = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};

const levelFor = (total: number, max: number) => {
    if (total <= 0 || max <= 0) return 0;
    return Math.max(1, Math.ceil((total / max) * LEVELS));
};

const buildCalendar = (stats: DailySummary[], today: Date) => {
    const totals = new Map<string, number>();
    stats.forEach((s) => totals.set(s.logDate.substring(0, 10), s.total));

    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - (WEEKS - 1) * 7);
    const days: { key: string; total: number; week: number; weekday: number }[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        if (date > today) break;
        const key = toKey(date);
        days.push({ key, total: totals.get(key) ?? 0, week: Math.floor(i / 7), weekday: i % 7 });
    }
    return days;
};

const UserActivityStatsWidget = () => {
    const { data: auditLogStats } = useAuditLogStatsQuery();

    const days = auditLogStats && auditLogStats.length > 0 ? buildCalendar(auditLogStats, new Date()) : [];
    const max = Math.max(0, ...days.map((d) => d.total));
    const width = WEEKS * (CELL + GAP) - GAP;
    const height = 7 * (CELL + GAP) - GAP;

    return (
        <DashboardWidget title="User activity (last 20 weeks)">
            {max > 0 ? (
                <>
                    <svg className="activity-heatmap" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily user activity heatmap">
                        {days.map((d) => (
                            <rect
                                key={d.key}
                                className={`activity-heatmap-cell level-${levelFor(d.total, max)}`}
                                x={d.week * (CELL + GAP)}
                                y={d.weekday * (CELL + GAP)}
                                width={CELL}
                                height={CELL}
                                rx={3}
                            >
                                <title>{`${d.key}: ${d.total} ${d.total === 1 ? "action" : "actions"}`}</title>
                            </rect>
                        ))}
                    </svg>
                    <div className="activity-heatmap-legend">
                        <span>Less</span>
                        {Array.from({ length: LEVELS + 1 }, (_, level) => (
                            <span key={level} className={`activity-heatmap-swatch level-${level}`} />
                        ))}
                        <span>More</span>
                    </div>
                </>
            ) : (
                <p>Not enough data to generate the chart.</p>
            )}
        </DashboardWidget>
    );
};

export default UserActivityStatsWidget;
