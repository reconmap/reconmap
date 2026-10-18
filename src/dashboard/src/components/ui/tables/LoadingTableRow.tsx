import Skeleton from "../Skeleton";

const LoadingTableRow = ({ numColumns, numRows = 5 }: any) => {
    return (
        <>
            {Array.from({ length: numRows }, (_, rowIndex) => (
                <tr key={rowIndex} aria-busy="true">
                    {Array.from({ length: numColumns }, (_, columnIndex) => (
                        <td key={columnIndex}>
                            <Skeleton width={columnIndex === 0 ? "80%" : "60%"} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default LoadingTableRow;
