const VisibilityLegend = ({ visibility }) => {
    return <>{visibility === "public" ? <>Public</> : <>Private</>}</>;
};

export default VisibilityLegend;
