import { AgentsUrls } from "components/agents/AgentsRoutes.jsx";
import OrganisationsUrls from "components/clients/OrganisationsUrls";
import SearchUrls from "components/search/SearchUrls";
import { ToolsUrls } from "components/tools/Routes.jsx";
import ExternalLink from "components/ui/ExternalLink";
import Configuration from "Configuration";
import { AuthContext } from "contexts/AuthContext";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ServerIssuesUrl, UserManualUrl } from "ServerUrls";
import NotificationsBadge from "../notifications/NotificationsBadge";
import SearchBox from "../search/Box";
import HeaderUserMenu from "../ui/HeaderUserMenu";
import { DashboardUrls } from "./dashboard/Routes";
import HeaderLogo from "./HeaderLogo";

const getMenuLinks = (t) => [
    {
        name: t("Projects"),
        title: t("Projects, tasks, reports, and templates"),
        items: [
            { name: t("Projects"), title: t("Browse all projects"), url: "/projects" },
            { name: t("Tasks"), title: t("Review project tasks"), url: "/tasks" },
            { name: t("Reports"), title: t("Browse project reports"), url: "/reports" },
            null,
            { name: t("Project templates"), title: t("Manage project templates"), url: "/projects/templates" },
            { name: t("Report templates"), title: t("Manage report templates"), url: "/reports/templates" },
        ],
    },
    {
        name: t("Library"),
        title: t("Commands, vulnerabilities, documents, and search"),
        items: [
            { name: t("Commands"), title: t("Browse command library"), url: "/commands", permissions: "commands.*" },
            {
                name: t("Vulnerabilities"),
                title: t("Browse vulnerability library"),
                url: "/vulnerabilities",
                permissions: "commands.*",
            },
            { name: t("Documents"), title: t("Browse document library"), url: "/documents", permissions: "documents.*" },
            null,
            { name: t("Search"), title: t("Open advanced search"), url: SearchUrls.AdvancedSearch },
        ],
    },
    {
        name: t("Tools"),
        title: t("Security tools and agents"),
        items: [
            { name: t("Vault"), title: t("Open the secrets vault"), url: ToolsUrls.Vault, permissions: "commands.*" },
            {
                name: t("Password generator"),
                title: t("Generate strong passwords"),
                url: ToolsUrls.PasswordGenerator,
                permissions: "commands.*",
            },
            null,
            { name: t("Agents"), title: t("Manage agents"), url: AgentsUrls.List },
        ],
    },
    {
        name: t("Settings"),
        title: t("Application settings and administration"),
        items: [
            { name: t("Users"), title: t("Manage users"), url: "/users" },
            { name: t("Organisations"), title: t("Manage organisations"), url: OrganisationsUrls.List },
            null,
            {
                name: t("Integrations"),
                title: t("Configure integrations"),
                url: "/integrations",
                permissions: "administrator",
            },
            null,
            { name: t("Custom fields"), title: t("Manage custom fields"), url: "/settings/custom-fields" },
            { name: t("Export data"), title: t("Export system data"), url: "/system/export-data" },
            { name: t("Import data"), title: t("Import system data"), url: "/system/import-data" },
        ],
    },
    {
        name: t("Help & Support"),
        title: t("Help resources, system status, and support"),
        items: [
            { name: t("User manual"), title: t("Open the user manual"), url: UserManualUrl, external: true },
            {
                name: t("API docs"),
                title: t("Open the API documentation"),
                url: `${Configuration.getDefaultApiUrl()}/../swagger/`,
                external: true,
            },
            null,
            { name: t("System health"), title: t("Check system health"), url: "/system/health" },
            { name: t("System usage"), title: t("Review system usage"), url: "/system/usage" },
            { name: t("System integrations"), title: t("Review system integration status"), url: "/system/integrations" },
            { name: t("Audit log"), title: t("Browse the audit log"), url: "/auditlog" },
            null,
            { name: t("Support"), title: t("Open the support form"), url: "/support" },
            { name: t("Log issue"), title: t("Open the issue tracker"), url: ServerIssuesUrl, external: true },
        ],
    },
];

const Header = () => {
    const [t] = useTranslation();
    const { user } = useContext(AuthContext);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const menuLinks = getMenuLinks(t);

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
                    {menuLinks.map((menuLink) => {
                        return (
                            <div
                                key={menuLink.name}
                                className={`navbar-item has-dropdown ${activeMenu === menuLink.name ? "is-active" : ""}`}
                            >
                                <a
                                    className="navbar-link"
                                    href="#"
                                    title={menuLink.title}
                                    onClick={() => setActiveMenu(activeMenu === menuLink.name ? null : menuLink.name)}
                                >
                                    {menuLink.name}
                                </a>
                                <div className="navbar-dropdown is-boxed">
                                    {menuLink.items.map((item, index) => {
                                        return null === item ? (
                                            <hr className="navbar-divider" key={`${menuLink.name}-divider-${index}`} />
                                        ) : item.hasOwnProperty("external") ? (
                                            <div className="navbar-item" key={item.url}>
                                                <ExternalLink href={item.url} title={item.title}>
                                                    {item.name}
                                                </ExternalLink>
                                            </div>
                                        ) : (
                                            <Link
                                                key={item.url}
                                                className="navbar-item"
                                                to={item.url}
                                                title={item.title}
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
