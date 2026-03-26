import LibraryLayout from "layouts/LibraryLayout.jsx";
import AddDocumentPage from "pages/documents/Add";
import DocumentDetailsPage from "pages/documents/Details";
import EditDocumentPage from "pages/documents/Edit";
import { Route } from "react-router-dom";
import { DocumentsUrls } from "AppUrls";
import DocumentsListPage from "./List.jsx";

const DocumentsRoutes = [
    <Route path={DocumentsUrls.List} element={<LibraryLayout />}>
        <Route index element={<DocumentsListPage />} />,
        <Route path={`:documentId`} element={<DocumentDetailsPage />} />,
        <Route path={`:documentId/edit`} element={<EditDocumentPage />} />,
        <Route path={`add`} element={<AddDocumentPage />} />,
    </Route>,
];

export default DocumentsRoutes;
