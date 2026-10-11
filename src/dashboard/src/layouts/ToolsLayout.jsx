import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import SidemenuLayout from "./SidemenuLayout.jsx";

const ToolsLayout = () => {
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);
    const toolsSection = navigation.find(section => section.name === t("Tools"));
    const links = toolsSection ? toolsSection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default ToolsLayout;