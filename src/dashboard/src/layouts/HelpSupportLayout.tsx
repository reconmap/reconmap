import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import SidemenuLayout from "./SidemenuLayout";

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
