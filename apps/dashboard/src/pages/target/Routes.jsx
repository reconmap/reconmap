import TargetForm from "components/target/Form";
import ProjectsLayout from "layouts/Layout.jsx";
import TargetView from "pages/target/View";
import { Route } from "react-router-dom";

const TargetsRoutes = [
    <Route element={<ProjectsLayout />}>
        <Route path={`/projects/:projectId/targets/add`} element={<TargetForm />} />
        <Route path={`/targets/:targetId`} element={<TargetView />} />
    </Route>,
]

export default TargetsRoutes;
