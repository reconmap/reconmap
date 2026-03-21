import { Navigate, Route } from "react-router-dom";
import ScansLayout from "./ScansLayout";
import ScansPage from "./ScansPage";

const ScansRoutes = [
    <Route path="/scans" element={<ScansLayout />}>
        <Route index element={<Navigate to="run-once" />} />
        <Route path="run-once" element={<ScansPage mode="once" />} />
        <Route path="run-on-schedule" element={<ScansPage mode="on_schedule" />} />
        <Route path="schedules" element={<ScansPage mode="schedules" />} />
        <Route path="import" element={<ScansPage mode="import" />} />
    </Route>,
];

export default ScansRoutes;
