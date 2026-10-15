import SupportForm from "components/support/Form";
import HelpSupportLayout from "layouts/HelpSupportLayout";
import { Route } from "react-router";

const SupportRoutes = [
    <Route element={<HelpSupportLayout />}>
        <Route path={`/support`} element={<SupportForm />} />
    </Route>,
]

export default SupportRoutes;
