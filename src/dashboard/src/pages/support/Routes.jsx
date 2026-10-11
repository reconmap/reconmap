import SupportForm from "components/support/Form";
import HelpSupportLayout from "layouts/HelpSupportLayout.jsx";
import { Route } from "react-router-dom";

const SupportRoutes = [
    <Route element={<HelpSupportLayout />}>
        <Route path={`/support`} element={<SupportForm />} />
    </Route>,
]

export default SupportRoutes;
