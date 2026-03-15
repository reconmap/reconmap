import SidemenuLayout from "components/layout/SidemenuLayout";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

const SettingsLayout = ({ children }) => {
    const [t] = useTranslation();
    const location = useLocation();

    const links = [
        { type: "label", name: "General", items: [] },
        {
            type: "menu",
            name: t("Users"),
            url: "/users",
            permissions: "settings.*",
            children: [{ name: "Create", url: "/users/create", permissions: "settings.*" }],
        },
        {
            type: "menu",
            name: t("Organisations"),
            url: "/organisations",
        },
        { type: "label", name: t("Configuration") },
        {
            type: "menu",
            name: t("Custom fields"),
            url: "/settings/custom-fields",
        },
        { type: "label", name: t("Data") },
        {
            type: "menu",
            name: "Export data",
            url: "/system/export-data",
        },
        {
            type: "menu",
            name: "Import data",
            url: "/system/import-data",
        },
    ];

    return (
        <SidemenuLayout links={links}>
            <Outlet />
        </SidemenuLayout>
    );
};

export default SettingsLayout;
