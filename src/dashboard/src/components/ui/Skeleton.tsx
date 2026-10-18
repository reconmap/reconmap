import "./Skeleton.css";

export default function Skeleton({ width = "100%", height = "1em", style = {} }: any) {
    return <span className="skeleton" aria-hidden="true" style={{ width, height, ...style }} />;
}
