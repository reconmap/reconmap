import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import SidemenuLayout from "./SidemenuLayout";

const SettingsLayout = () => {
    const [t] = useTranslation();

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
