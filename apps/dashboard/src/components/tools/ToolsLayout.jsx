import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavigationStructure } from "components/layout/NavigationStructure";

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