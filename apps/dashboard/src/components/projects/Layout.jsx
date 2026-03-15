import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet, useLocation } from "react-router-dom";

const ProjectsLayout = ({ children }) => {
    const location = useLocation();
    const links = [
        { type: "label", name: "General", items: [] },
        {
            type: "menu",
            name: "Projects",
            url: "/projects",
            children: [{ name: "Create", url: "/projects/create", permissions: "projects.create" }],
        },
        {
            type: "menu",
            name: "Tasks",
            url: "/tasks",
            children: [{ name: "Create", url: "/tasks/create", permissions: "tasks.create" }],
        },
        {
            type: "menu",
            name: "Reports",
            url: "/reports",
            children: [{ name: "Templates", url: "/reports/templates", permissions: "tasks.create" }],
        },
        { type: "label", name: "Configuration" },
        {
            type: "menu",
            name: "Templates",
            url: "/projects/templates",
            children: [{ name: "Create", url: "/projects/create?isTemplate=true", permissions: "projects.templates" }],
        },
    ];
    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default ProjectsLayout;
