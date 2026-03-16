import { Route } from "react-router-dom";
import WebhooksListPage from "./List";
import WebhookCreatePage from "./Create";
import WebhookEditPage from "./Edit";

const WebhooksRoutes = [
    <Route path="/webhooks" key="webhooks-list" element={<WebhooksListPage />} />,
    <Route path="/webhooks/create" key="webhooks-create" element={<WebhookCreatePage />} />,
    <Route path="/webhooks/:webhookId/edit" key="webhooks-edit" element={<WebhookEditPage />} />,
];

export default WebhooksRoutes;
