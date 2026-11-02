import { FindingsUrls } from "AppUrls";
import ProjectsLayout from "layouts/ProjectsLayout";
import FindingCategoriesPage from "pages/findings/categories/FindingCategoriesPage";
import FindingCreatePage from "pages/findings/FindingCreatePage";
import FindingDetailsPage from "pages/findings/FindingDetailsPage";
import FindingEditPage from "pages/findings/FindingEditPage";
import FindingsListPage from "pages/findings/FindingsListPage";
import type { RouteObject } from "react-router";

const FindingRoutes: RouteObject[] = [
    {
        path: FindingsUrls.List,
        element: <ProjectsLayout />,
        children: [
            { index: true, element: <FindingsListPage /> },
            { path: "create", element: <FindingCreatePage /> },
            { path: ":findingId", element: <FindingDetailsPage /> },
            { path: ":findingId/edit", element: <FindingEditPage /> },
            { path: "categories", element: <FindingCategoriesPage /> },
        ],
    },
];

export default FindingRoutes;
