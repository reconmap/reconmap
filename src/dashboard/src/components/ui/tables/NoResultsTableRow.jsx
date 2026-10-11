import NoResults from "../NoResults";

const NoResultsTableRow = ({ numColumns }) => {
    return (
        <tr>
            <td colSpan={numColumns}>
                <NoResults />
            </td>
        </tr>
    );
};

export default NoResultsTableRow;
