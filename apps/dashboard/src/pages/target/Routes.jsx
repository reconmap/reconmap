import ProjectsLayout from "components/projects/Layout.jsx";
import { Route } from "react-router-dom";
import TargetForm from "components/target/Form";
import TargetView from "pages/target/View";

const TargetsRoutes = [
    <Route element={<ProjectsLayout />}>
        <Route path={`/projects/:projectId/targets/add`} element={<TargetForm />} />
        <Route path={`/targets/:targetId`} element={<TargetView />} />
    </Route>,
]

export default TargetsRoutes;
