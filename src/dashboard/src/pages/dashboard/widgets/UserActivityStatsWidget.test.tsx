import { render, screen } from "@testing-library/react";
import UserActivityStatsWidget from "./UserActivityStatsWidget";

const { statsData } = vi.hoisted(() => ({ statsData: { current: [] as { logDate: string; total: number }[] } }));

vi.mock("api/auditlog", () => ({
    useAuditLogStatsQuery: () => ({ data: statsData.current }),
}));

const dayKey = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

describe("UserActivityStatsWidget", () => {
    it("shows a placeholder when there is no data", () => {
        statsData.current = [];
        render(<UserActivityStatsWidget />);

        expect(screen.getByText(/not enough data/i)).toBeTruthy();
    });

    it("renders a cell per day with the action count in its tooltip", () => {
        statsData.current = [
            { logDate: `${dayKey(1)}T00:00:00`, total: 10 },
            { logDate: `${dayKey(0)}T00:00:00`, total: 1 },
        ];
        render(<UserActivityStatsWidget />);

        expect(screen.getByText(`${dayKey(1)}: 10 actions`)).toBeTruthy();
        expect(screen.getByText(`${dayKey(0)}: 1 action`)).toBeTruthy();
    });
});
