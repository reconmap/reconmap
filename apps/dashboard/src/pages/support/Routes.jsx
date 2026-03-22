import { Route } from "react-router-dom";
import SupportForm from "components/support/Form";
import HelpSupportLayout from "components/HelpSupportLayout.jsx";

const SupportRoutes = [
    <Route element={<HelpSupportLayout />}>
        <Route path={`/support`} element={<SupportForm />} />
    </Route>,
]

export default SupportRoutes;
