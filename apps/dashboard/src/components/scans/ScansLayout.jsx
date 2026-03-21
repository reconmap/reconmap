import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavigationStructure } from "components/layout/NavigationStructure";

const ScansLayout = () => {
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);
    const scansSection = navigation.find(section => section.name === t("Scans"));
    const links = scansSection ? scansSection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default ScansLayout;
