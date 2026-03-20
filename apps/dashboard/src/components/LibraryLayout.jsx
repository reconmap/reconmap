import SidemenuLayout from "components/layout/SidemenuLayout";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNavigationStructure } from "components/layout/NavigationStructure";

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
