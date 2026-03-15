import UserAvatar from "components/badges/UserAvatar";
import { AuthContext } from "contexts/AuthContext";
import useToggle from "hooks/useToggle";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import KeyCloakService from "services/keycloak";
import ExternalLink from "./ExternalLink";

const HeaderUserMenu = () => {
    const [t] = useTranslation();
    const { user, logout } = useContext(AuthContext);

    const { value, toggle } = useToggle(false);

    return (
        <div className={`dropdown ${value ? "is-active" : ""}`}>
            <div className="dropdown-trigger">
                <button className="button" aria-haspopup="true" aria-controls="dropdown-menu" onClick={toggle}>
                    <span>
                        <UserAvatar email={user.email} /> <span color="gray.500">{KeyCloakService.getUsername()}</span>{" "}
                        (<span>{user.role}</span>)
                    </span>
                    <span className="icon is-small">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                </button>
            </div>{" "}
            <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    <div className="dropdown-item">
                        <ExternalLink href={KeyCloakService.getProfileUrl()}>Identity settings</ExternalLink>
                    </div>
                    <Link className="dropdown-item" to={`/users/${user.id}`}>
                        <div>Your profile</div>
                    </Link>
                    <Link className="dropdown-item" to="/users/preferences">
                        <div>Your preferences</div>
                    </Link>
                    <hr className="dropdown-divider" />
                    <Link className="dropdown-item" to="/" onClick={logout}>
                        {t("Logout")}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HeaderUserMenu;
