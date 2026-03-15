import LoadingTableRow from "./LoadingTableRow.jsx";

const defaultCellRenderer = (column, row) => {
    return row[column.property] ?? "-";
};

const NativeTable = ({ caption = undefined, columns = [], rows = [], rowId = () => { }, emptyRowsMessage = 'No results available.' }) => {
    const enabledColumns = columns.filter((column) => column.enabled === undefined || column.enabled);
    const numColumns = enabledColumns.length;

    const rowsAreLoading = undefined === rows || null === rows;
    const rowsAreEmpty = !rowsAreLoading && 0 === rows.length;

    return (
        <table className="table is-fullwidth">
            {caption && <caption className="title is-6">{caption}</caption>}
            <thead>
                <tr>
                    {enabledColumns.map((column) => (
                        <th className={column.className || ""}>{column.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rowsAreLoading && <LoadingTableRow numColumns={numColumns} />}
                {rowsAreEmpty && <tr>
                    <td colSpan={numColumns} style={{ textAlign: 'center' }}>
                        ∅ {emptyRowsMessage}
                    </td>
                </tr>}
                {!rowsAreLoading &&
                    rows.map((row) => (
                        <tr key={rowId(row)}>
                            {enabledColumns.map((column) => (
                                <td>{column.cell ? column.cell(row) : defaultCellRenderer(column, row)}</td>
                            ))}
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default NativeTable;
