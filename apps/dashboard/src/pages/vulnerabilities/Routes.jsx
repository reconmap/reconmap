import LibraryLayout from "components/LibraryLayout";
import { Route } from "react-router-dom";
import VulnerabilityCategoriesPage from "pages/vulnerabilities/categories/List";
import VulnerabilityCreate from "pages/vulnerabilities/Create";
import VulnerabilityDetails from "pages/vulnerabilities/Details";
import VulnerabilityEdit from "pages/vulnerabilities/Edit";
import VulnerabilitiesList from "pages/vulnerabilities/List";

const VulnerabilitiesRoutes = [
    <Route path="/vulnerabilities" element={<LibraryLayout />}>
        <Route index element={<VulnerabilitiesList />} />,
        <Route path={`create`} element={<VulnerabilityCreate />} />,
        <Route path={`:vulnerabilityId`} element={<VulnerabilityDetails />} />,
        <Route path={`:vulnerabilityId/edit`} element={<VulnerabilityEdit />} />
        <Route path={`categories`} element={<VulnerabilityCategoriesPage />} />,
    </Route>,
];

export default VulnerabilitiesRoutes;
