import { useNavigate } from "react-router-dom";

const LinkButton = ({ children, external = false, ...props }) => {
    const navigate = useNavigate();

    const onAnchorClick = (ev) => {
        ev.stopPropagation();

        if (!external) {
            ev.preventDefault();

            navigate({
                pathname: ev.target.pathname,
                search: ev.target.search,
            });
        }
    };

    return (
        <a onClick={onAnchorClick} target={external ? "_blank" : ""} className="button" {...props}>
            {children}
        </a>
    );
};

export default LinkButton;
