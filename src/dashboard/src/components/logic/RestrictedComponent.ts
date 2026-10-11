import { AuthContext } from "contexts/AuthContext.jsx";
import { useContext } from "react";

const RestrictedComponent = ({
    roles,
    children,
    message = "",
}: {
    roles: string[];
    children: any;
    message: string;
}) => {
    const { user } = useContext(AuthContext);

    return !user || !roles.includes(user.role) ? message : children;
};

export default RestrictedComponent;
