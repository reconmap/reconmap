import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";

const links = [
    {
        type: "menu",
        name: "Commands",
        url: "/commands",
        children: [{ name: "Create", url: "/commands/add", permissions: "tasks.create" }],
    },
    { type: "label", name: "General", items: [] },
    {
        type: "menu",
        name: "Vulnerabilities",
        url: "/vulnerabilities",
        children: [
            { name: "Create", url: "/vulnerabilities/create", permissions: "vulnerabilities.*" },
            { name: "Categories", url: "/vulnerabilities/categories", permissions: "vulnerabilities.*" },
            { name: "Templates", url: "/vulnerabilities/templates", permissions: "vulnerabilities.*" },
        ],
    },
    {
        type: "menu",
        name: "Documents",
        url: "/documents",
        children: [{ name: "Create", url: "/documents/add", permissions: "tasks.create" }],
    },
];

const LibraryLayout = ({ children }) => {
    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default LibraryLayout;
