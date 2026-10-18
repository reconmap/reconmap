import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SystemUsageWidget from "./SystemUsageWidget";

const { usageData } = vi.hoisted(() => ({
    usageData: {
        attachments: { totalCount: 1234, totalFileSize: 2048 },
        redis: { available: true, usedMemoryBytes: 1024, maxMemoryBytes: 0, keyCount: 5 },
        queues: [
            { name: "a", messages: 3, consumers: 1 },
            { name: "b", messages: 4, consumers: 1 },
        ],
        ai: {
            totals: { calls: 10, failedCalls: 1, inputTokens: 1500, outputTokens: 500, estimatedCost: 0.5, averageLatencyMs: 1, p95LatencyMs: 2 },
        },
    },
}));

vi.mock("api/system.js", () => ({
    useSystemUsageQuery: () => ({ data: usageData, isError: false }),
}));

const renderWidget = () =>
    render(
        <MemoryRouter>
            <SystemUsageWidget />
        </MemoryRouter>,
    );

describe("SystemUsageWidget", () => {
    it("shows AI usage and cost", () => {
        renderWidget();

        expect(screen.getByText(/1,500 \/ 500/)).toBeTruthy();
        expect(screen.getByText("$0.50")).toBeTruthy();
    });

    it("sums the messages waiting across queues", () => {
        renderWidget();

        expect(screen.getByText("7")).toBeTruthy();
    });

    it("links to the system usage page", () => {
        renderWidget();

        expect(screen.getByText("View details").getAttribute("href")).toBe("/system/usage");
    });
});
