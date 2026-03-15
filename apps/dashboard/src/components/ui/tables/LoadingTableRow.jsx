import Loading from "../Loading.jsx";

const LoadingTableRow = ({ numColumns }) => {
    return (
        <tr>
            <td colSpan={numColumns} style={{ padding: "20px" }}>
                <Loading />
            </td>
        </tr>
    );
};

export default LoadingTableRow;
