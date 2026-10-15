import { Link } from "react-router";
import "./Link.css";

const UserLink = ({ userId, children }: any) => {
    return (
        <Link className="user-link" to={`/users/${userId}`}>
            {children}
        </Link>
    );
};

export default UserLink;
