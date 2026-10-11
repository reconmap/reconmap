export default function Badge({ children, color = "text-color", fontSize = "fontSizeXsmall", icon }) {
    const styles = {
        badge: {
            color: `var(--${color})`,
            alignItems: "center",
            display: `inline-flex`,
            fontSize: `var(--${fontSize})`,
            backgroundColor: `var(--${color}Dark)`,
        },
    };
    return (
        <span style={styles.badge}>
            {icon}
            {children}
        </span>
    );
}
