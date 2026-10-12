import { Link } from "react-router-dom";

const SortLink = ({ callback, property, direction = "asc" }: any) => (
    <Link to="#" onClick={(ev) => callback(ev, property, direction)}>{direction === "desc" ? <>&darr;</> : <>&uarr;</>}</Link>
);

export default SortLink;
