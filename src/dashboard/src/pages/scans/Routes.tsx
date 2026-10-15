import ScansLayout from "layouts/ScansLayout";
import { Navigate, Route } from "react-router";
import { ScansUrls } from "AppUrls";
import ScansPage from "./List";

const ScansRoutes = [
    <Route path={ScansUrls.List} element={<ScansLayout />}>
        <Route index element={<Navigate to="run-once" />} />
        <Route path="run-once" element={<ScansPage mode="once" />} />

        <Route path="schedules" element={<ScansPage mode="schedules" />} />
        <Route path="import" element={<ScansPage mode="import" />} />
    </Route>,
];

export default ScansRoutes;
