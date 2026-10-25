import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import ScanRunDetailsPage from "./ScanRunDetailsPage";
import { useScanRunQuery } from "api/scans";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("react-router", () => ({
    useParams: () => ({ runId: "7" }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

vi.mock("api/scans", () => ({
    useScanRunQuery: vi.fn(),
}));

vi.mock("components/ui/RelativeDateFormatter", () => ({
    default: () => <span>some time ago</span>,
}));

vi.mock("components/ui/PageTitle", () => ({
    default: () => null,
}));

const run = (overrides = {}) => ({
    id: 7,
    target: "example.com",
    objective: "Web scan",
    strategy: "Check TLS then ports",
    status: "running",
    createdAt: "2026-10-19T10:00:00Z",
    tasks: [
        { id: 1, position: 1, commandName: "testssl", executablePath: "testssl", arguments: "example.com", rationale: "Certificate checks", status: "succeeded" },
        { id: 2, position: 2, commandName: "Nmap", executablePath: "nmap", arguments: "-oX - example.com", status: "failed", error: "exec: nmap not found" },
    ],
    ...overrides,
});

describe("ScanRunDetailsPage", () => {
    it("shows strategy, resolved commands, per-tool status and errors", () => {
        (vi.mocked(useScanRunQuery) as any).mockReturnValue({ data: run(), isLoading: false, isError: false });

        render(<ScanRunDetailsPage />);

        expect(screen.getByText("Check TLS then ports")).toBeInTheDocument();
        expect(screen.getByText("nmap -oX - example.com")).toBeInTheDocument();
        expect(screen.getByText("exec: nmap not found")).toBeInTheDocument();
        expect(screen.getByText("Succeeded")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.getByText(/keeps running if you leave/)).toBeInTheDocument();
    });

    it("does not show the keep-running hint once the scan has finished", () => {
        (vi.mocked(useScanRunQuery) as any).mockReturnValue({ data: run({ status: "partial" }), isLoading: false, isError: false });

        render(<ScanRunDetailsPage />);

        expect(screen.queryByText(/keeps running if you leave/)).not.toBeInTheDocument();
    });

    it("shows an error when the scan cannot be loaded", () => {
        (vi.mocked(useScanRunQuery) as any).mockReturnValue({ data: undefined, isLoading: false, isError: true });

        render(<ScanRunDetailsPage />);

        expect(screen.getByText("The scan could not be loaded.")).toBeInTheDocument();
    });
});
