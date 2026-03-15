import LibraryLayout from "components/LibraryLayout.jsx";
import { Route } from "react-router-dom";
import AddDocumentPage from "./Add";
import DocumentDetailsPage from "./Details";
import DocumentsListPage from "./DocumentsListPage";
import EditDocumentPage from "./Edit";

const DocumentsRoutes = [
    <Route path={`/documents`} element={<LibraryLayout />}>
        <Route index element={<DocumentsListPage />} />,
        <Route path={`:documentId`} element={<DocumentDetailsPage />} />,
        <Route path={`:documentId/edit`} element={<EditDocumentPage />} />,
        <Route path={`add`} element={<AddDocumentPage />} />,
    </Route>,
];

export default DocumentsRoutes;
