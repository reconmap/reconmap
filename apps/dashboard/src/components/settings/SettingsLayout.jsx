import SidemenuLayout from "components/layout/SidemenuLayout";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { getNavigationStructure } from "components/layout/NavigationStructure";

const SettingsLayout = ({ children }) => {
    const [t] = useTranslation();
    const location = useLocation();

    const navigation = getNavigationStructure(t);
    const settingsSection = navigation.find(section => section.name === t("Settings"));
    const links = settingsSection ? settingsSection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default SettingsLayout;
