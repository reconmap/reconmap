import { Route } from "react-router-dom";
import TargetForm from "./Form";
import TargetView from "./View";

const TargetsRoutes = [
    <Route path={`/projects/:projectId/targets/add`} element={<TargetForm />} />,
    <Route path={`/targets/:targetId`} element={<TargetView />} />,
]

export default TargetsRoutes;
