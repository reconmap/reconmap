import SettingsLayout from "components/settings/SettingsLayout";
import { Route } from "react-router-dom";
import WebhooksListPage from "./List";
import WebhookCreatePage from "./Create";
import WebhookEditPage from "./Edit";

const WebhooksRoutes = [
    <Route path="/webhooks" element={<SettingsLayout />}>
        <Route index element={<WebhooksListPage />} />
        <Route path="create" element={<WebhookCreatePage />} />
        <Route path=":webhookId/edit" element={<WebhookEditPage />} />
    </Route>,
];

export default WebhooksRoutes;
