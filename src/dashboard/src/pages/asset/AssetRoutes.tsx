import AssetForm from "components/asset/AssetForm";
import ProjectsLayout from "layouts/ProjectsLayout";
import AssetDetailsPage from "pages/asset/AssetDetailsPage";
import type { RouteObject } from "react-router";

const AssetRoutes: RouteObject[] = [
    {
        element: <ProjectsLayout />,
        children: [
            { path: "/projects/:projectId/assets/add", element: <AssetForm /> },
            { path: "/assets/:assetId", element: <AssetDetailsPage /> },
        ],
    },
];

export default AssetRoutes;
