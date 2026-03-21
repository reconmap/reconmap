const CssIcon = ({ name, style = {} }) => {
    return <i className={`fas fa-${name}`} style={{ lineHeight: "var(--bulma-line-height)", ...style }}></i>;
};

export default CssIcon;
