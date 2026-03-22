import ExternalLink from "components/ui/ExternalLink";
import { AuthContext } from "contexts/AuthContext";
import { DashboardUrls } from "pages/dashboard/Routes.jsx";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import NotificationsBadge from "../notifications/NotificationsBadge";
import SearchBox from "../search/Box";
import HeaderUserMenu from "../ui/HeaderUserMenu";
import HeaderLogo from "./HeaderLogo";
import { getNavigationStructure } from "./NavigationStructure";

const Header = () => {
    const [t] = useTranslation();
    const { user } = useContext(AuthContext);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const menuLinks = getNavigationStructure(t).filter(item => !item.isRoot);

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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveMenu(activeMenu === menuLink.name ? null : menuLink.name);
                                    }}
                                >
                                    {menuLink.name}
                                </a>
                                <div className="navbar-dropdown is-boxed">
                                    {menuLink.items.map((item, index) => {
                                        return item.type === "divider" ? (
                                            <hr className="navbar-divider" key={`${menuLink.name}-divider-${index}`} />
                                        ) : item.hasOwnProperty("external") && item.external ? (
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
