import Loading from "../Loading";

const LoadingTableRow = ({ numColumns }: any) => {
    return (
        <tr>
            <td colSpan={numColumns} style={{ padding: "20px" }}>
                <Loading />
            </td>
        </tr>
    );
};

export default LoadingTableRow;
