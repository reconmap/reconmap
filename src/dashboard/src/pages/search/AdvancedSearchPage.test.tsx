import { useRecentSearchesQuery } from "api/system";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useParams } from "react-router";
import AdvancedSearchPage from "./AdvancedSearchPage";

vi.mock("react-i18next", () => ({
    useTranslation: () => [(key) => key],
}));

vi.mock("api/system", () => ({ useRecentSearchesQuery: vi.fn() }));
vi.mock("components/ui/Breadcrumb", () => ({ default: () => <div data-testid="breadcrumb" /> }));

const SearchResultsProbe = () => {
    const { keywords } = useParams();
    const { search } = useLocation();

    return <div data-testid="results">{`${keywords}${search}`}</div>;
};

const renderPage = () =>
    render(
        <MemoryRouter initialEntries={["/advanced-search"]}>
            <Routes>
                <Route path="/advanced-search" element={<AdvancedSearchPage />} />
                <Route path="/search/:keywords" element={<SearchResultsProbe />} />
            </Routes>
        </MemoryRouter>,
    );

const mockRecentSearches = (state: object) => vi.mocked(useRecentSearchesQuery).mockReturnValue(state as any);

it("shows a message when there are no recent searches", () => {
    mockRecentSearches({ data: [], isLoading: false, isError: false });

    const { getByText } = renderPage();

    expect(getByText("No recent searches yet. Your searches will appear here.")).toBeInTheDocument();
});

it("shows a message when recent searches cannot be loaded", () => {
    mockRecentSearches({ data: undefined, isLoading: false, isError: true });

    const { getByRole } = renderPage();

    expect(getByRole("alert")).toHaveTextContent("Could not load recent searches.");
});

it("shows a loading indicator while recent searches load", () => {
    mockRecentSearches({ data: undefined, isLoading: true, isError: false });

    const { getByText } = renderPage();

    expect(getByText("Loading...")).toBeInTheDocument();
});

it("links each recent search to an encoded results URL", () => {
    mockRecentSearches({ data: ["100% off"], isLoading: false, isError: false });

    const { getByRole } = renderPage();

    expect(getByRole("link", { name: "100% off" })).toHaveAttribute("href", "/search/100%25%20off");
});

it("keeps the search button disabled until keywords are entered", () => {
    mockRecentSearches({ data: [], isLoading: false, isError: false });

    const { getByLabelText, getByRole } = renderPage();

    expect(getByRole("button", { name: "Search" })).toBeDisabled();

    fireEvent.change(getByLabelText("Keywords"), { target: { value: "nmap" } });

    expect(getByRole("button", { name: "Search" })).toBeEnabled();
});

it("submits encoded keywords with the selected entities", () => {
    mockRecentSearches({ data: [], isLoading: false, isError: false });

    const { getByLabelText, getByRole, getByTestId } = renderPage();

    fireEvent.change(getByLabelText("Keywords"), { target: { value: "100% off" } });
    fireEvent.click(getByLabelText("Tasks"));
    fireEvent.click(getByRole("button", { name: "Search" }));

    expect(getByTestId("results")).toHaveTextContent(
        "100% off?entities=findings,finding_templates,projects,project_templates",
    );
});

it("disables search and explains the problem when no entity is selected", () => {
    mockRecentSearches({ data: [], isLoading: false, isError: false });

    const { getByLabelText, getByRole, getByText } = renderPage();

    fireEvent.change(getByLabelText("Keywords"), { target: { value: "nmap" } });
    ["Tasks", "Findings", "Finding templates", "Projects", "Project templates"].forEach((label) =>
        fireEvent.click(getByLabelText(label)),
    );

    expect(getByRole("button", { name: "Search" })).toBeDisabled();
    expect(getByText("Select at least one type to search in.")).toBeInTheDocument();
});
