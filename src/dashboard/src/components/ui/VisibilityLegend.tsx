const VisibilityLegend = ({ visibility }: any) => {
    return <>{visibility === "public" ? <>Public</> : <>Private</>}</>;
};

export default VisibilityLegend;
