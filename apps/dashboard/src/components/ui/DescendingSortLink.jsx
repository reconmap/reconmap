import SortLink from "./tables/SortLink";

const DescendingSortLink = ({ callback, property }) => <SortLink callback={callback} property={property} direction="desc" />

export default DescendingSortLink;
