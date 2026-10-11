import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ScanTargetForm from "./ScanTargetForm";
import { ensureUrlAsset } from "services/scans/url";
import { requestToolRecommendation } from "api/requests/recommendations.js";
import { useProjectsQuery } from "api/projects.js";

// Mock translation
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key
    }),
}));

// Mock projects query
vi.mock("api/projects.js", () => ({
    useProjectsQuery: vi.fn(),
}));

// Mock recommendations request
vi.mock("api/requests/recommendations.js", () => ({
    requestToolRecommendation: vi.fn(),
}));

// Mock ensureUrlAsset service
vi.mock("services/scans/url", () => ({
    ensureUrlAsset: vi.fn(),
}));

// Mock RecommendationResults
vi.mock("./RecommendationResults.jsx", () => ({
    default: () => <div data-testid="recommendation-results">Mocked Results</div>,
}));

describe("ScanTargetForm", () => {
    const mockProjects = {
        data: [
            { id: 1, name: "Project Alpha" },
            { id: 2, name: "Project Beta" },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useProjectsQuery).mockReturnValue({
            data: mockProjects,
            isLoading: false,
        });
    });

    it("renders form elements correctly", () => {
        render(<ScanTargetForm />);
        expect(screen.getByText("Project")).toBeInTheDocument();
        expect(screen.getByText("Target")).toBeInTheDocument();
        expect(screen.getByText("Objective")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Start scan" })).toBeInTheDocument();
    });

    it("submits the scan request and calls ensureUrlAsset if the target is a URL", async () => {
        vi.mocked(requestToolRecommendation).mockResolvedValue({
            json: () => Promise.resolve({ recommendations: [] }),
        });
        vi.mocked(ensureUrlAsset).mockResolvedValue({});

        render(<ScanTargetForm />);

        // Select project (first combobox)
        const comboboxes = screen.getAllByRole("combobox");
        fireEvent.change(comboboxes[0], { target: { value: "1" } });

        // Input target URL
        const targetInput = screen.getByPlaceholderText("e.g. https://example.com, 192.168.1.1, example.com");
        fireEvent.change(targetInput, {
            target: { value: "https://target-url.com" },
        });

        // Click start scan
        fireEvent.click(screen.getByRole("button", { name: "Start scan" }));

        await waitFor(() => {
            expect(ensureUrlAsset).toHaveBeenCalledWith(1, "https://target-url.com");
            expect(requestToolRecommendation).toHaveBeenCalledWith({
                target: "https://target-url.com",
                targetType: "url",
                objective: "Full reconnaissance",
                projectId: 1,
            });
        });
    });

    it("submits the scan request and does NOT call ensureUrlAsset if target is not a URL", async () => {
        vi.mocked(requestToolRecommendation).mockResolvedValue({
            json: () => Promise.resolve({ recommendations: [] }),
        });

        render(<ScanTargetForm />);

        // Select project (first combobox)
        const comboboxes = screen.getAllByRole("combobox");
        fireEvent.change(comboboxes[0], { target: { value: "2" } });

        // Input target IP
        const targetInput = screen.getByPlaceholderText("e.g. https://example.com, 192.168.1.1, example.com");
        fireEvent.change(targetInput, {
            target: { value: "192.168.1.1" },
        });

        // Click start scan
        fireEvent.click(screen.getByRole("button", { name: "Start scan" }));

        await waitFor(() => {
            expect(ensureUrlAsset).not.toHaveBeenCalled();
            expect(requestToolRecommendation).toHaveBeenCalledWith({
                target: "192.168.1.1",
                targetType: "ip",
                objective: "Full reconnaissance",
                projectId: 2,
            });
        });
    });
});
