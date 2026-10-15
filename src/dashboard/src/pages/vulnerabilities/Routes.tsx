import { VulnerabilitiesUrls } from "AppUrls";
import ProjectsLayout from "layouts/Layout";
import VulnerabilityCategoriesPage from "pages/vulnerabilities/categories/List";
import VulnerabilityCreate from "pages/vulnerabilities/Create";
import VulnerabilityDetails from "pages/vulnerabilities/Details";
import VulnerabilityEdit from "pages/vulnerabilities/Edit";
import VulnerabilitiesList from "pages/vulnerabilities/List";
import type { RouteObject } from "react-router";

const VulnerabilitiesRoutes: RouteObject[] = [
    {
        path: VulnerabilitiesUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <VulnerabilitiesList /> },
            { path: "create", element: <VulnerabilityCreate /> },
            { path: ":vulnerabilityId", element: <VulnerabilityDetails /> },
            { path: ":vulnerabilityId/edit", element: <VulnerabilityEdit /> },
            { path: "categories", element: <VulnerabilityCategoriesPage /> },
        ],
    },
];

export default VulnerabilitiesRoutes;
