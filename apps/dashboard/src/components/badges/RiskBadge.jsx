const RISKS = {
    none: { color: "green" },
    low: { color: "green" },
    medium: { color: "yellow" },
    high: { color: "red" },
    critical: { color: "red" },
};

const RiskBadge = ({ risk, fontSize = "fontSizeXsmall" }) => {
    const styles = {
        badge: {
            color: `var(--${RISKS[risk].color},white)`,
            alignItems: "center",
            display: `inline-flex`,
            border: `var(--borderWidth,2px) solid var(--${RISKS[risk].color}Dark)`,
            fontSize: `var(--${fontSize})`,
            fontWeight: "var(--fontBold)",
        },
    };

    return <span style={styles.badge}>{risk}</span>;
};

export default RiskBadge;
