const CvssScore = ({ score, fontSize = "fontSizeXsmall" }) => {
    const color =
        Math.floor(score) <= 3
            ? "green"
            : Math.floor(score) <= 6
              ? "yellow"
              : "red";

    if (score === null) {
        return <>-</>;
    }

    return (
        <span style={{ color: `var(--${color})`, fontWeight: 700 }}>
            {score}
        </span>
    );
};

export default CvssScore;
