import { useNavigate } from "react-router";

const LinkButton = ({ children, external = false, href, ...props }: any) => {
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

    // Without an href there is nowhere to navigate to, so render a real button for actions
    const Tag = href ? "a" : "button";

    return (
        <Tag
            onClick={onAnchorClick}
            href={href}
            type={href ? undefined : "button"}
            target={external ? "_blank" : undefined}
            className="button"
            {...props}
        >
            {children}
        </Tag>
    );
};

export default LinkButton;
