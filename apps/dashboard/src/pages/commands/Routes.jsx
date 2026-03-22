import LibraryLayout from "components/LibraryLayout";
import AddCommandPage from "pages/commands/Add";
import EditCommandPage from "pages/commands/Edit";
import { Route } from "react-router-dom";
import AddCommandUsagePage from "./AddUsage.jsx";
import CommandDetailsPage from "./Details.jsx";
import CommandsListPage from "./List.jsx";

const CommandsRoutes = [
    <Route path="/commands" element={<LibraryLayout />}>
        <Route index element={<CommandsListPage />} />,
        <Route path=":commandId" element={<CommandDetailsPage />} />,
        <Route path=":commandId/edit" element={<EditCommandPage />} />,
        <Route path=":commandId/usages" element={<AddCommandUsagePage />} />,
        <Route path="add" element={<AddCommandPage />} />,
    </Route>,
];

export default CommandsRoutes;
