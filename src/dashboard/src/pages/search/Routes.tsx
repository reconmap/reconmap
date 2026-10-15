import AdvancedSearch from "components/search/AdvancedSearch";
import ToolsLayout from "layouts/ToolsLayout";
import type { RouteObject } from "react-router";
import { SearchUrls } from "AppUrls";
import SearchResultsPage from "./Results";

const SearchRoutes: RouteObject[] = [
    {
        element: <ToolsLayout />,
        children: [
            { path: SearchUrls.KeywordsSearch, element: <SearchResultsPage /> },
            { path: SearchUrls.AdvancedSearch, element: <AdvancedSearch /> },
        ],
    },
];

export default SearchRoutes;
