import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import SidemenuLayout from "./SidemenuLayout.jsx";

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
