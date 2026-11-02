import { requestFindings } from "api/requests/findings";
import FindingTableModel from "components/findings/FindingTableModel";
import { useEffect, useState } from "react";
import { ignoreAbortError } from "utilities/abort";
import FindingsTable from "../findings/FindingsTable";

const FindingsSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }: any) => {
    const [tableModel, setTableModel] = useState(new FindingTableModel());

    useEffect(() => {
        const controller = new AbortController();

        const reloadData = () => {
            requestFindings({ isTemplate: "false", keywords }, { signal: controller.signal }).then((findings) => {
                setTableModel((tableModel) => ({ ...tableModel, findings: findings.data }));
                setEmptyResults((emptyResults) =>
                    0 === findings.data.length
                        ? emptyResults.concat("findings")
                        : emptyResults.filter((value) => value !== "findings"),
                );
            }).catch(ignoreAbortError);
        };

        reloadData();

        return () => controller.abort();
    }, [keywords, setTableModel, setEmptyResults]);

    if (tableModel.findings.length === 0) return <></>;

    return (
        <>
            <h3>{tableModel.findings.length} matching findings</h3>
            <FindingsTable tableModel={tableModel} tableModelSetter={setTableModel} showSelection={false} />
        </>
    );
};

export default FindingsSearchResults;
