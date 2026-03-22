import { getNavigationStructure } from "components/layout/NavigationStructure";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import SidemenuLayout from "./SidemenuLayout.jsx";

const LibraryLayout = () => {
    const [t] = useTranslation();
    const navigation = getNavigationStructure(t);
    const librarySection = navigation.find(section => section.name === t("Library"));
    const links = librarySection ? librarySection.items : [];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default LibraryLayout;
