import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import type { AiUsageSummary } from "api/system";

const { usageQuery, emptyAi, filledAi } = vi.hoisted(() => {
    const emptyAi = {
        totals: { calls: 0, failedCalls: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0, averageLatencyMs: 0, p95LatencyMs: 0 },
        byFeature: [],
        byModel: [],
        byProject: [],
        byUser: [],
        daily: [],
    };
    const filledAi = {
        totals: { calls: 4, failedCalls: 1, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5, averageLatencyMs: 250, p95LatencyMs: 900 },
        byFeature: [{ key: "triage", calls: 4, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5 }],
        byModel: [{ key: "OpenRouter / some/model", calls: 4, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5 }],
        byProject: [{ projectId: 1, projectName: "Acme", calls: 4, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5 }],
        byUser: [{ userId: null, calls: 4, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5 }],
        daily: [{ date: "2026-10-17T00:00:00Z", calls: 4, inputTokens: 3000, outputTokens: 1000, estimatedCost: 1.5 }],
    };
    return {
        emptyAi,
        filledAi,
        usageQuery: vi.fn(),
    };
});

vi.mock("api/system.js", () => ({
    useSystemUsageQuery: (days: number) => usageQuery(days),
}));

import SystemUsagePage from "./Usage";

const usage = (ai: unknown) => ({
    isLoading: false,
    data: {
        attachments: { totalCount: 2, totalFileSize: 2048 },
        redis: { available: true, usedMemoryBytes: 1048576, maxMemoryBytes: 0, keyCount: 42 },
        queues: [{ name: "tasks", messages: 5, consumers: 1 }],
        ai: ai as AiUsageSummary,
    },
});

const renderPage = () =>
    render(
        <QueryClientProvider client={new QueryClient()}>
            <MemoryRouter>
                <SystemUsagePage />
            </MemoryRouter>
        </QueryClientProvider>,
    );

describe("SystemUsagePage", () => {
    it("shows AI totals, estimated cost and breakdowns", () => {
        usageQuery.mockReturnValue(usage(filledAi));

        renderPage();

        expect(screen.getAllByText("$1.50").length).toBeGreaterThan(0);
        expect(screen.getByText("25.0% (1 failed)")).toBeInTheDocument();
        expect(screen.getByText("triage")).toBeInTheDocument();
        expect(screen.getByText("Acme")).toBeInTheDocument();
        expect(screen.getByText("Unattributed")).toBeInTheDocument();
    });

    it("shows redis metrics and rabbitmq queue depth", () => {
        usageQuery.mockReturnValue(usage(filledAi));

        renderPage();
        fireEvent.click(screen.getByRole("button", { name: "Infrastructure" }));

        expect(screen.getByText("42")).toBeInTheDocument();
        expect(screen.getByText("tasks")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("explains when no AI calls were recorded", () => {
        usageQuery.mockReturnValue(usage(emptyAi));

        renderPage();

        expect(screen.getByText("No AI calls were recorded in this period.")).toBeInTheDocument();
    });

    it("requests the selected time range", () => {
        usageQuery.mockReturnValue(usage(filledAi));

        renderPage();
        fireEvent.change(screen.getByLabelText("Time range"), { target: { value: "90" } });

        expect(usageQuery).toHaveBeenLastCalledWith(90);
    });
});
