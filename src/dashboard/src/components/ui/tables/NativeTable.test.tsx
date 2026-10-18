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

    it("shows the empty message when there are no rows", () => {
        render(<NativeTable columns={columns} rows={[]} />);

        expect(screen.getByText(/No results available/)).toBeInTheDocument();
    });

    it("shows a custom empty message", () => {
        render(<NativeTable columns={columns} rows={[]} emptyRowsMessage="Nothing here" />);

        expect(screen.getByText(/Nothing here/)).toBeInTheDocument();
    });

    it("renders the caption", () => {
        render(<NativeTable caption="Users" columns={columns} rows={[]} />);

        expect(screen.getByText("Users")).toBeInTheDocument();
    });

    it("skips disabled columns", () => {
        const cols = [...columns, { header: "Hidden", enabled: false, cell: () => "secret" }];
        render(<NativeTable columns={cols} rows={[{ id: 1, name: "Ada", role: "admin" }]} rowId={(r) => r.id} />);

        expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
        expect(screen.queryByText("secret")).not.toBeInTheDocument();
    });

    it("renders a property column and falls back to a dash for missing values", () => {
        type Row = { id: number; name?: string };
        const cols = [{ header: "Name", property: "name" as const }];
        render(
            <NativeTable<Row>
                columns={cols}
                rows={[{ id: 1, name: "Ada" }, { id: 2 }]}
                rowId={(r) => r.id}
            />,
        );

        expect(screen.getByText("Ada")).toBeInTheDocument();
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("applies the column className to the header", () => {
        render(<NativeTable columns={[{ header: "Name", className: "wide", cell: () => "x" }]} rows={[]} />);

        expect(screen.getByText("Name")).toHaveClass("wide");
    });

    it("sets the empty row colSpan to the number of enabled columns", () => {
        const { container } = render(<NativeTable columns={columns} rows={[]} />);

        expect(container.querySelector("tbody td")).toHaveAttribute("colspan", "2");
    });
});
