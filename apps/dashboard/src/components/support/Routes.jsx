import { Route } from "react-router-dom";
import SupportForm from "./Form";
import HelpIndexPage from "./HelpIndex";

const SupportRoutes = [
    <Route path={`/help`} element={<HelpIndexPage />} />,
    <Route path={`/support`} element={<SupportForm />} />,
]

export default SupportRoutes;
