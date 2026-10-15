import AssetForm from "components/asset/Form";
import ProjectsLayout from "layouts/Layout";
import AssetView from "pages/asset/View";
import type { RouteObject } from "react-router";

const AssetsRoutes: RouteObject[] = [
    {
        element: <ProjectsLayout />,
        children: [
            { path: "/projects/:projectId/assets/add", element: <AssetForm /> },
            { path: "/assets/:assetId", element: <AssetView /> },
        ],
    },
];

export default AssetsRoutes;
