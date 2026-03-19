import { Link, useLocation } from "react-router-dom";

const SidemenuLayout = ({ children, links }) => {
    const { pathname, search } = useLocation();

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
        <div className="columns">
            <div className="column is-2">
                <aside className="menu">
                    {links.map((item) => {
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
                                    <Link className={isPathActive(item.url) ? "is-active" : ""} to={item.url}>
                                        {item.name}
                                    </Link>
                                    {item.children && item.children.length > 0 && (
                                        <ul>
                                            {item.children.map((child) => {
                                                return (
                                                    <li key={`submenu_${child.name}`}>
                                                        <Link
                                                            className={isPathActive(child.url) ? "is-active" : ""}
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
                </aside>
            </div>
            <div className="column">{children}</div>
        </div>
    );
};

export default SidemenuLayout;
