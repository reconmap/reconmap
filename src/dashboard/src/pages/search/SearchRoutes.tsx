import AdvancedSearchPage from "pages/search/AdvancedSearchPage";
import ToolsLayout from "layouts/ToolsLayout";
import type { RouteObject } from "react-router";
import { SearchUrls } from "AppUrls";
import SearchResultsPage from "./SearchResultsPage";

const SearchRoutes: RouteObject[] = [
    {
        element: <ToolsLayout />,
        children: [
            { path: SearchUrls.KeywordsSearch, element: <SearchResultsPage /> },
            { path: SearchUrls.AdvancedSearch, element: <AdvancedSearchPage /> },
        ],
    },
];

export default SearchRoutes;
