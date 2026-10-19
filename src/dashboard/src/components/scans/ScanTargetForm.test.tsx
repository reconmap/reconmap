import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ScanTargetForm from "./ScanTargetForm";
import { ensureUrlAsset } from "services/scans/url";
import { requestScanRunPost } from "api/requests/scans";
import { useProjectsQuery } from "api/projects";
import { errorToast } from "components/ui/toast";

const navigate = vi.fn();
vi.mock("react-router", () => ({
    useNavigate: () => navigate,
}));

vi.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => key
    }),
}));

vi.mock("api/projects.js", () => ({
    useProjectsQuery: vi.fn(),
}));

vi.mock("api/requests/scans.js", () => ({
    requestScanRunPost: vi.fn(),
}));

vi.mock("services/scans/url", () => ({
    ensureUrlAsset: vi.fn(),
}));

vi.mock("components/ui/toast", () => ({
    errorToast: vi.fn(),
}));

const PLACEHOLDER = "e.g. https://example.com, 192.168.1.1, example.com";

describe("ScanTargetForm", () => {
    const mockProjects = {
        data: [
            { id: 1, name: "Project Alpha" },
            { id: 2, name: "Project Beta" },
        ],
    };

    const fillAndSubmit = (projectId: string, target: string, objective?: string) => {
        const comboboxes = screen.getAllByRole("combobox");
        fireEvent.change(comboboxes[0], { target: { value: projectId } });
        if (objective) fireEvent.change(comboboxes[1], { target: { value: objective } });
        fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER), { target: { value: target } });
        fireEvent.click(screen.getByRole("button", { name: "Start scan" }));
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (vi.mocked(useProjectsQuery) as any).mockReturnValue({
            data: mockProjects,
            isLoading: false,
        });
        (vi.mocked(requestScanRunPost) as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: 99 }),
        });
    });

    it("renders form elements correctly", () => {
        render(<ScanTargetForm />);
        expect(screen.getByText("Project")).toBeInTheDocument();
        expect(screen.getByText("Target")).toBeInTheDocument();
        expect(screen.getByText("Objective")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Start scan" })).toBeInTheDocument();
    });

    it("creates a scan run with the chosen objective, registers URL assets and opens the run page", async () => {
        vi.mocked(ensureUrlAsset).mockResolvedValue({} as any);

        render(<ScanTargetForm />);
        fillAndSubmit("1", "https://target-url.com", "Web scan");

        await waitFor(() => {
            expect(ensureUrlAsset).toHaveBeenCalledWith(1, "https://target-url.com");
            expect(requestScanRunPost).toHaveBeenCalledWith({
                target: "https://target-url.com",
                targetType: "url",
                objective: "Web scan",
                projectId: 1,
            });
            expect(navigate).toHaveBeenCalledWith("/scans/runs/99");
        });
    });

    it("does NOT call ensureUrlAsset if target is not a URL", async () => {
        render(<ScanTargetForm />);
        fillAndSubmit("2", "192.168.1.1");

        await waitFor(() => {
            expect(ensureUrlAsset).not.toHaveBeenCalled();
            expect(requestScanRunPost).toHaveBeenCalledWith({
                target: "192.168.1.1",
                targetType: "ip",
                objective: "Full reconnaissance",
                projectId: 2,
            });
        });
    });

    it("shows the server message and stays on the page when the scan cannot be started", async () => {
        (vi.mocked(requestScanRunPost) as any).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: "No tool supports this objective" }),
        });

        render(<ScanTargetForm />);
        fillAndSubmit("1", "192.168.1.1", "Code audit");

        await waitFor(() => expect(errorToast).toHaveBeenCalledWith("No tool supports this objective"));
        expect(navigate).not.toHaveBeenCalled();
    });
});
