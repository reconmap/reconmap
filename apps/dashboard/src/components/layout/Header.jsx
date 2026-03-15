import { AgentsUrls } from "components/agents/AgentsRoutes.jsx";
import OrganisationsUrls from "components/clients/OrganisationsUrls";
import SearchUrls from "components/search/SearchUrls";
import { ToolsUrls } from "components/tools/Routes.jsx";
import ExternalLink from "components/ui/ExternalLink";
import Configuration from "Configuration";
import { AuthContext } from "contexts/AuthContext";
import { t } from "i18next";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ServerIssuesUrl, UserManualUrl } from "ServerUrls";
import NotificationsBadge from "../notifications/NotificationsBadge";
import SearchBox from "../search/Box";
import HeaderUserMenu from "../ui/HeaderUserMenu";
import { DashboardUrls } from "./dashboard/Routes";
import HeaderLogo from "./HeaderLogo";

const MenuLinks = [
    {
        name: t("Projects"),
        items: [{ name: t("List"), url: "/projects" }, null, { name: t("Tasks"), url: "/tasks" }],
    },
    {
        name: t("Library"),
        items: [
            { name: t("Commands"), url: "/commands", permissions: "commands.*" },
            { name: t("Findings"), url: "/vulnerabilities", permissions: "commands.*" },
            { name: t("Documents"), url: "/documents", permissions: "documents.*" },
            null,
            { name: t("Search"), url: SearchUrls.AdvancedSearch },
        ],
    },
    {
        name: t("Tools"),
        items: [
            { name: t("Vault"), url: ToolsUrls.Vault, permissions: "commands.*" },
            { name: t("Password generator"), url: ToolsUrls.PasswordGenerator, permissions: "commands.*" },
            null,
            { name: t("Agents"), url: AgentsUrls.List },
        ],
    },
    {
        name: t("Settings"),
        items: [
            { name: t("Users"), url: "/users" },
            { name: t("Organisations"), url: OrganisationsUrls.List },
            null,
            { name: t("Custom fields"), url: "/settings/custom-fields" },
            null,
            { name: t("Export data"), url: "/system/export-data" },
            { name: t("Import data"), url: "/system/import-data" },
        ],
    },
    {
        name: t("Help & Support"),
        items: [
            { name: t("User manual"), url: UserManualUrl, external: true },
            { name: t("API docs"), url: `${Configuration.getDefaultApiUrl()}/docs/`, external: true },
            { name: t("System health"), url: "/system/health" },
            { name: t("System usage"), url: "/system/usage" },
            null,
            { name: t("Audit log"), url: "/auditlog" },
            { name: t("Integrations"), url: "/system/integrations" },
            null,
            { name: t("Support info"), url: "/support" },
            { name: t("Log issue"), url: ServerIssuesUrl, external: true },
        ],
    },
];

const Header = () => {
    const [t] = useTranslation();
    const { user } = useContext(AuthContext);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isActive, setIsActive] = useState(false);

    const toggleNavBarMenu = () => {
        setIsActive(!isActive);
    };

    return (
        <nav className="navbar is-fixed-top is-dark">
            <div className="navbar-brand">
                <Link to="/" className="navbar-brand">
                    <HeaderLogo />
                </Link>
                <div
                    className={`navbar-burger ${isActive ? "is-active" : ""}`}
                    data-target="appMenu"
                    onClick={toggleNavBarMenu}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div id="appMenu" className={`navbar-menu ${isActive ? "is-active" : ""}`}>
                <div className="navbar-start">
                    <Link className="navbar-item" to={DashboardUrls.DEFAULT}>
                        {t("Dashboard")}
                    </Link>
                    {MenuLinks.map((menuLink) => {
                        return (
                            <div
                                key={menuLink.name}
                                className={`navbar-item has-dropdown ${activeMenu === menuLink.name ? "is-active" : ""}`}
                            >
                                <a
                                    className="navbar-link"
                                    href="#"
                                    onClick={() => setActiveMenu(activeMenu === menuLink.name ? null : menuLink.name)}
                                >
                                    {menuLink.name}
                                </a>
                                <div className="navbar-dropdown is-boxed">
                                    {menuLink.items.map((item) => {
                                        return null === item ? (
                                            <hr className="navbar-divider" />
                                        ) : item.hasOwnProperty("external") ? (
                                            <div className="navbar-item">
                                                <ExternalLink href={item.url}>{item.name}</ExternalLink>
                                            </div>
                                        ) : (
                                            <Link
                                                className="navbar-item"
                                                to={item.url}
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="field is-grouped">
                            <div className="control">
                                <SearchBox />
                            </div>
                            <div className="control">
                                <NotificationsBadge />
                            </div>
                            <div className="control">{user && <HeaderUserMenu email={user.email} />}</div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
