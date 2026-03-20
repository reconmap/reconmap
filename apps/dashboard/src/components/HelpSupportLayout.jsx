import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";

const links = [
    { type: "label", name: "General", items: [] },
    {
        type: "menu",
        name: "System health",
        url: "/system/health",
        children: [{ name: "Overview", url: "/system-health/overview", permissions: "system.health" }],
    },
    {
        type: "menu",
        name: "System usage",
        url: "/system/usage",
        children: [{ name: "Overview", url: "/system-health/overview", permissions: "system.health" }],
    }, {
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

const HelpSupportLayout = () => {
    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default HelpSupportLayout;
