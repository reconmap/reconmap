import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet, useLocation } from "react-router-dom";

const LibraryLayout = ({ children }) => {
    const location = useLocation();
    const links = [
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
            name: "Commands",
            url: "/commands",
            children: [{ name: "Create", url: "/commands/add", permissions: "tasks.create" }],
        },
        {
            type: "menu",
            name: "Documents",
            url: "/documents",
            children: [{ name: "Create", url: "/documents/add", permissions: "tasks.create" }],
        },
    ];
    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default LibraryLayout;
