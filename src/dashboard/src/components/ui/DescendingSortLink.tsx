import SortLink from "./tables/SortLink";

const DescendingSortLink = ({ callback, property }: any) => <SortLink callback={callback} property={property} direction="desc" />

export default DescendingSortLink;
