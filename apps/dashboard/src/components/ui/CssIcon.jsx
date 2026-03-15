const CssIcon = ({ name }) => {
    return <i className={`fas fa-${name}`} style={{ lineHeight: "var(--bulma-line-height)" }}></i>;
};

export default CssIcon;
