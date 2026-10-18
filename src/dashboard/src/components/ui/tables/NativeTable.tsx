import type { Key, ReactNode } from "react";
import LoadingTableRow from "./LoadingTableRow";

export interface NativeTableColumn<T> {
    header?: ReactNode;
    property?: keyof T & string;
    className?: string;
    enabled?: boolean;
    cell?: (row: T) => ReactNode;
}

export interface NativeTableProps<T> {
    caption?: ReactNode;
    columns?: NativeTableColumn<T>[];
    rows?: T[] | null;
    rowId?: (row: T) => Key;
    emptyRowsMessage?: ReactNode;
    isLoading?: boolean;
}

const defaultCellRenderer = <T,>(column: NativeTableColumn<T>, row: T): ReactNode => {
    if (column.property === undefined) return "-";
    return (row[column.property] as ReactNode) ?? "-";
};

const NativeTable = <T,>({
    caption = undefined,
    columns = [],
    rows = [],
    rowId = () => "",
    emptyRowsMessage = "No results available.",
    isLoading = false,
}: NativeTableProps<T>) => {
    const enabledColumns = columns.filter((column) => column.enabled === undefined || column.enabled);
    const numColumns = enabledColumns.length;

    const rowsAreLoading = isLoading || undefined === rows || null === rows;
    const rowsAreEmpty = !rowsAreLoading && 0 === rows.length;

    return (
        <table className="table is-fullwidth">
            {caption && <caption className="title is-6">{caption}</caption>}
            <thead>
                <tr>
                    {enabledColumns.map((column, index) => (
                        <th key={column.property ?? `header-${index}`} className={column.className || ""}>
                            {column.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rowsAreLoading && <LoadingTableRow numColumns={numColumns} />}
                {rowsAreEmpty && (
                    <tr>
                        <td colSpan={numColumns} style={{ textAlign: "center" }}>
                            ∅ {emptyRowsMessage}
                        </td>
                    </tr>
                )}
                {!rowsAreLoading &&
                    rows.map((row) => (
                        <tr key={rowId(row)}>
                            {enabledColumns.map((column, index) => (
                                <td key={column.property ?? `cell-${rowId(row)}-${index}`}>
                                    {column.cell ? column.cell(row) : defaultCellRenderer(column, row)}
                                </td>
                            ))}
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

export default NativeTable;
