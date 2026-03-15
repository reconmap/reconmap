import Configuration from "Configuration";

const HeaderLogo = () => {
    return (
        <h3>
            <img alt="Logo" src={Configuration.getLogoUrl()} />
        </h3>
    );
};

export default HeaderLogo;
