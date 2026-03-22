import SettingsLayout from "components/settings/SettingsLayout";
import { Route } from "react-router-dom";
import WebhookCreatePage from "./Create.jsx";
import WebhookEditPage from "./Edit.jsx";
import WebhooksListPage from "./List.jsx";

const WebhooksRoutes = [
    <Route path="/integrations/webhooks" element={<SettingsLayout />}>
        <Route index element={<WebhooksListPage />} />
        <Route path="create" element={<WebhookCreatePage />} />
        <Route path=":webhookId/edit" element={<WebhookEditPage />} />
    </Route>,
];

export default WebhooksRoutes;
