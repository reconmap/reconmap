import AssetForm from "components/asset/Form";
import ProjectsLayout from "layouts/Layout.jsx";
import AssetView from "pages/asset/View";
import { Route } from "react-router-dom";

const AssetsRoutes = [
    <Route element={<ProjectsLayout />}>
        <Route path={`/projects/:projectId/assets/add`} element={<AssetForm />} />
        <Route path={`/assets/:assetId`} element={<AssetView />} />
    </Route>,
]

export default AssetsRoutes;
