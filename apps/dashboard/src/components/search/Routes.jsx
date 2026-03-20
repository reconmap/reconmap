import LibraryLayout from "components/LibraryLayout.jsx";
import { Route } from "react-router-dom";
import AdvancedSearch from "./AdvancedSearch";
import SearchResultsPage from "./SearchResultsPage";
import SearchUrls from "./SearchUrls";

const SearchRoutes = [
    <Route element={<LibraryLayout />}>
        <Route path={SearchUrls.KeywordsSearch} element={<SearchResultsPage />} />
        <Route path={SearchUrls.AdvancedSearch} element={<AdvancedSearch />} />
    </Route>,
];

export default SearchRoutes;
