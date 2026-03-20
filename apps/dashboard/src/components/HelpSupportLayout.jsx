import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavigationStructure } from "components/layout/NavigationStructure";

const HelpSupportLayout = () => {
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);
    const helpSection = navigation.find(section => section.name === t("Help & Support"));
    const links = helpSection ? helpSection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default HelpSupportLayout;
