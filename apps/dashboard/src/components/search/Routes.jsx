import { Route } from "react-router-dom";
import AdvancedSearch from "./AdvancedSearch";
import SearchResultsPage from "./SearchResultsPage";
import SearchUrls from "./SearchUrls";

const SearchRoutes = [
    <Route path={SearchUrls.KeywordsSearch} element={<SearchResultsPage />} />,
    <Route path={SearchUrls.AdvancedSearch} element={<AdvancedSearch />} />,
];

export default SearchRoutes;
