import { Link } from "react-router-dom";

const SortLink = ({ callback, property, direction = "asc" }) => (
    <Link onClick={(ev) => callback(ev, property, direction)}>{direction === "desc" ? <>&darr;</> : <>&uarr;</>}</Link>
);

export default SortLink;
