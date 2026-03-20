import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SIDEMENU_COLLAPSED_STORAGE_KEY = "dashboard.sidemenu.collapsed";

const SidemenuLayout = ({ children, links }) => {
    const { pathname, search } = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return window.localStorage.getItem(SIDEMENU_COLLAPSED_STORAGE_KEY) === "true";
    });

    useEffect(() => {
        window.localStorage.setItem(SIDEMENU_COLLAPSED_STORAGE_KEY, String(isCollapsed));
    }, [isCollapsed]);

    const normalizePath = (path = "/") => {
        const normalized = path.replace(/\/+$/, "");
        return normalized === "" ? "/" : normalized;
    };

    const normalizeSearch = (query = "") => {
        const params = new URLSearchParams(query);
        const sortedEntries = Array.from(params.entries()).sort(([keyA, valueA], [keyB, valueB]) => {
            if (keyA === keyB) {
                return valueA.localeCompare(valueB);
            }

            return keyA.localeCompare(keyB);
        });

        return new URLSearchParams(sortedEntries).toString();
    };

    const splitTargetUrl = (targetUrl = "") => {
        const [pathAndQuery] = targetUrl.split("#");
        const [rawPath, rawQuery = ""] = pathAndQuery.split("?");

        return {
            targetPath: normalizePath(rawPath || "/"),
            targetQuery: normalizeSearch(rawQuery),
        };
    };

    const isPathActive = (targetUrl) => {
        const currentPath = normalizePath(pathname);
        const currentQuery = normalizeSearch(search);
        const { targetPath, targetQuery } = splitTargetUrl(targetUrl);

        return currentPath === targetPath && currentQuery === targetQuery;
    };

    return (
        <div className="columns sidemenu-layout">
            <div className={`column ${isCollapsed ? "is-narrow sidemenu-column is-collapsed" : "is-2 sidemenu-column"}`}>
                <aside className="menu">
                    <button
                        type="button"
                        className="button is-small is-light sidemenu-toggle"
                        onClick={() => setIsCollapsed((current) => !current)}
                        aria-expanded={!isCollapsed}
                        aria-controls="sidemenu-links"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <span className="icon" aria-hidden="true">
                            <i className={`fas ${isCollapsed ? "fa-angles-right" : "fa-angles-left"}`}></i>
                        </span>
                        <span className="sidemenu-toggle-label">{isCollapsed ? "Expand" : "Collapse"}</span>
                    </button>
                    {!isCollapsed && (
                        <div id="sidemenu-links">
                            {links.map((item, index) => {
                                if (item.type === "divider") {
                                    return <hr key={`divider_${index}`} className="dropdown-divider" />;
                                }
                                if (item.type === "label") {
                                    return (
                                        <p key={item.name} className="menu-label">
                                            {item.name}
                                        </p>
                                    );
                                }

                                return (
                                    <ul key={item.name} className="menu-list">
                                        <li>
                                            {item.external ? (
                                                <a className={isPathActive(item.url) ? "is-active" : ""} href={item.url} target="_blank" rel="noopener noreferrer">
                                                    {item.name}
                                                </a>
                                            ) : (
                                                <Link className={isPathActive(item.url) ? "is-active" : ""} to={item.url}>
                                                    {item.name}
                                                </Link>
                                            )}
                                            {item.children && item.children.length > 0 && (
                                                <ul>
                                                    {item.children.map((child) => {
                                                        return (
                                                            <li key={`submenu_${child.name}`}>
                                                                <Link
                                                                    className={
                                                                        isPathActive(child.url) ? "is-active" : ""
                                                                    }
                                                                    to={child.url}
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    </ul>
                                );
                            })}
                        </div>
                    )}
                </aside>
            </div>
            <div className="column sidemenu-content-column">{children}</div>
        </div>
    );
};

export default SidemenuLayout;
