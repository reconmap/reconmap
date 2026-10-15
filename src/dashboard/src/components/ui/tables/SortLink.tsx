import { Link } from "react-router";

const SortLink = ({ callback, property, direction = "asc" }: any) => (
    <Link to="#" onClick={(ev) => callback(ev, property, direction)}>{direction === "desc" ? <>&darr;</> : <>&uarr;</>}</Link>
);

export default SortLink;
