import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchResultsPage from "./Results";

vi.mock("react-i18next", () => ({
    useTranslation: () => [(key) => key],
}));

vi.mock("components/ui/Breadcrumb.jsx", () => ({ default: () => <div data-testid="breadcrumb" /> }));
vi.mock("components/ui/Title", () => ({ default: ({ title }) => <div data-testid="title">{title}</div> }));
vi.mock("components/search/CommandsSearchResults.jsx", () => ({ default: () => <div data-testid="commands-search" /> }));
vi.mock("components/search/ProjectsSearchResults.jsx", () => ({ default: () => <div data-testid="projects-search" /> }));
vi.mock("components/search/ProjectTemplatesSearchResults.jsx", () => ({ default: () => <div data-testid="project-templates-search" /> }));
vi.mock("components/search/TasksSearchResults.jsx", () => ({ default: () => <div data-testid="tasks-search" /> }));
vi.mock("components/search/VulnerabilitiesSearchResults.jsx", () => ({ default: () => <div data-testid="vulnerabilities-search" /> }));
vi.mock("components/search/VulnerabilityTemplatesSearchResults.jsx", () => ({ default: () => <div data-testid="vulnerability-templates-search" /> }));

it("renders search results page with keywords", async () => {
    const { getByTestId, getByText } = render(
        <MemoryRouter initialEntries={["/search/my-test-query"]}>
            <Routes>
                <Route path="/search/:keywords" element={<SearchResultsPage />} />
            </Routes>
        </MemoryRouter>,
    );

    expect(getByTestId("title").textContent).toBe("my-test-query");
    expect(getByText("Advanced search")).toBeInTheDocument();
});
