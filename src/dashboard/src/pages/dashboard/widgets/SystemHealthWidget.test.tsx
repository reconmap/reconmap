import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import SystemHealthWidget from "./SystemHealthWidget";

const { healthData } = vi.hoisted(() => ({
    healthData: {
        attachmentsDirectory: true,
        databaseServer: { reachable: true, latencyMs: 3 },
        keyValueServer: { reachable: true, latencyMs: 1 },
        messageQueueServer: { reachable: false, latencyMs: 12 },
        mcpServer: { configured: true, reachable: true, latencyMs: 20 },
    },
}));

vi.mock("api/system.js", () => ({
    useSystemHealthQuery: () => ({ data: healthData, isError: false }),
}));

const renderWidget = () =>
    render(
        <MemoryRouter>
            <SystemHealthWidget />
        </MemoryRouter>,
    );

describe("SystemHealthWidget", () => {
    it("shows the MCP server as up with its latency", () => {
        renderWidget();

        expect(screen.getByText("MCP server")).toBeTruthy();
        expect(screen.getByText("(20 ms)")).toBeTruthy();
    });

    it("shows unreachable services as down", () => {
        renderWidget();

        expect(screen.getByText("Down")).toBeTruthy();
    });

    it("links to the system health page", () => {
        renderWidget();

        expect(screen.getByText("View details").getAttribute("href")).toBe("/system/health");
    });
});
