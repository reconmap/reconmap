import { Link } from "react-router-dom";

const SidemenuLayout = ({ children, links }) => {
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
                                    <Link className={location.pathname == item.url ? "is-active" : ""} to={item.url}>
                                        {item.name}
                                    </Link>
                                    {item.children && item.children.length > 0 && (
                                        <ul>
                                            {item.children.map((child) => {
                                                return (
                                                    <li key={`submenu_${child.name}`}>
                                                        <Link
                                                            className={
                                                                location.pathname == child.url ? "is-active" : ""
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
                </aside>
            </div>
            <div className="column">{children}</div>
        </div>
    );
};

export default SidemenuLayout;
