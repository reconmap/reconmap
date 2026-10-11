const styles = {
    stamp: {
        fontSize: `var(--fontSizeXsmall)`,
        color: `var(--text-color)`,
        opacity: ".6",
    },
};

const Timestamps = ({ createdAt, updatedAt }) => {
    return (
        <>
            <span style={styles.stamp}>
                <strong>Created at</strong>&nbsp;
                <time dateTime={createdAt}>{createdAt}</time>.
                {updatedAt && (
                    <div>
                        <strong>Modified at</strong>
                        &nbsp;
                        <time dateTime={updatedAt}>{updatedAt}</time>.
                    </div>
                )}
            </span>
        </>
    );
};

export default Timestamps;
