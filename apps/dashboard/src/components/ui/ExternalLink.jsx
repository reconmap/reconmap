const ExternalLink = (props) => {
    if (!props.children) {
        return "-";
    }

    return (
        <a target="_blank" rel="noopener noreferrer" {...props} className="is-link">
            {props.children} 🡥
        </a>
    );
};

export default ExternalLink;
