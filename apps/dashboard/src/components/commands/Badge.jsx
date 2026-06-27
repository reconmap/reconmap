
const CommandBadge = ({ command }) => {
    const styles = {
        badge: {
            alignItems: "center",
            display: `inline-flex`,
        },
    };

    return (
        <span style={styles.badge}>
            {command.name}
        </span>
    );
};

export default CommandBadge;
