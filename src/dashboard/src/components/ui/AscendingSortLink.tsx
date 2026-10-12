import SortLink from "./tables/SortLink";

const AscendingSortLink = ({ callback, property }: any) => <SortLink callback={callback} property={property} direction="asc" />

export default AscendingSortLink;
