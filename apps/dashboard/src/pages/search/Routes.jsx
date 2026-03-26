import AdvancedSearch from "components/search/AdvancedSearch";
import LibraryLayout from "layouts/LibraryLayout.jsx";
import { Route } from "react-router-dom";
import { SearchUrls } from "AppUrls";
import SearchResultsPage from "./Results.jsx";

const SearchRoutes = [
    <Route element={<LibraryLayout />}>
        <Route path={SearchUrls.KeywordsSearch} element={<SearchResultsPage />} />
        <Route path={SearchUrls.AdvancedSearch} element={<AdvancedSearch />} />
    </Route>,
];

export default SearchRoutes;
