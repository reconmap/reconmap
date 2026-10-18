import { render, screen } from "@testing-library/react";
import NativeTable from "./NativeTable";

const columns = [{ header: "Name", cell: (row) => row.name }, { header: "Role", cell: (row) => row.role }];

describe("NativeTable", () => {
    it("keeps the headers and shows skeleton rows while loading", () => {
        const { container } = render(<NativeTable columns={columns} rows={null} />);

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(container.querySelectorAll("tbody tr")).toHaveLength(5);
        expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
    });

    it("shows skeleton rows when isLoading is set", () => {
        const { container } = render(<NativeTable columns={columns} rows={[]} isLoading />);

        expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
        expect(screen.queryByText(/No results available/)).not.toBeInTheDocument();
    });

    it("renders the rows once loaded", () => {
        render(<NativeTable columns={columns} rows={[{ id: 1, name: "Ada", role: "admin" }]} rowId={(r) => r.id} />);

        expect(screen.getByText("Ada")).toBeInTheDocument();
    });
});
