import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RecommendationResults from "./RecommendationResults";
import { requestCommandSchedulePost } from "api/requests/commands.js";

// Mock i18next translation
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key
    }),
}));

// Mock command schedule post request
vi.mock("api/requests/commands.js", () => ({
    requestCommandSchedulePost: vi.fn(() => Promise.resolve({ ok: true }))
}));

describe("RecommendationResults", () => {
    const mockRecommendations = {
        strategy: "Scan strategy description",
        recommendations: [
            {
                commandId: 101,
                commandName: "Nmap port scan",
                order: 1,
                rationale: "Discover open ports",
                argumentValues: { HOSTS: "127.0.0.1" }
            },
            {
                commandId: 102,
                commandName: "Nikto web scan",
                order: 2,
                rationale: "Discover web vulnerabilities",
                argumentValues: { URL: "http://127.0.0.1" }
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders strategy description and list of recommended tools", async () => {
        render(
            <RecommendationResults
                recommendations={mockRecommendations}
                projectId={1}
                onQueued={() => {}}
            />
        );

        expect(screen.getByText(/Scan strategy description/)).toBeInTheDocument();
        expect(screen.getByText("Nmap port scan")).toBeInTheDocument();
        expect(screen.getByText("Nikto web scan")).toBeInTheDocument();

        // Wait for auto-queuing to finish to avoid state updates after test end
        await waitFor(() => {
            expect(requestCommandSchedulePost).toHaveBeenCalledTimes(2);
        });
    });

    it("automatically schedules all recommendations sequentially on mount", async () => {
        const onQueuedMock = vi.fn();

        render(
            <RecommendationResults
                recommendations={mockRecommendations}
                projectId={42}
                onQueued={onQueuedMock}
            />
        );

        // Wait until all recommendations have been processed and status is updated
        await waitFor(() => {
            expect(requestCommandSchedulePost).toHaveBeenCalledTimes(2);
        });

        expect(requestCommandSchedulePost).toHaveBeenNthCalledWith(1, 101, {
            projectId: 42,
            argumentValues: JSON.stringify({ HOSTS: "127.0.0.1" }),
            cronExpression: "once"
        });

        expect(requestCommandSchedulePost).toHaveBeenNthCalledWith(2, 102, {
            projectId: 42,
            argumentValues: JSON.stringify({ URL: "http://127.0.0.1" }),
            cronExpression: "once"
        });

        await waitFor(() => {
            expect(onQueuedMock).toHaveBeenCalled();
        });
    });

    it("handles queuing failures gracefully and displays failure status", async () => {
        // Mock the first command post to fail and the second to succeed
        vi.mocked(requestCommandSchedulePost).mockImplementation((commandId) => {
            if (commandId === 101) {
                return Promise.reject(new Error("Network Error"));
            }
            return Promise.resolve({ ok: true });
        });

        render(
            <RecommendationResults
                recommendations={mockRecommendations}
                projectId={42}
                onQueued={() => {}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Failed")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText("Queued")).toBeInTheDocument();
        });
    });
});
