import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import SidemenuLayout from "./SidemenuLayout.jsx";

const ProjectsLayout = ({ children }) => {
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);
    const projectsSection = navigation.find(section => section.name === t("Projects"));
    const links = projectsSection ? projectsSection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default ProjectsLayout;
