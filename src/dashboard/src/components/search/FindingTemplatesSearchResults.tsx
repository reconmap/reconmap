import { requestFindings } from "api/requests/findings";
import FindingTableModel from "components/findings/FindingTableModel";
import { useEffect, useState } from "react";
import { ignoreAbortError } from "utilities/abort";
import FindingsTable from "../findings/FindingsTable";

const FindingTemplatesSearchResults = ({ keywords, emptyResultsSetter: setEmptyResults }: any) => {
    const [tableModel, setTableModel] = useState(new FindingTableModel());

    useEffect(() => {
        const controller = new AbortController();

        const reloadData = () => {
            requestFindings({ isTemplate: "true", keywords }, { signal: controller.signal }).then((findingTemplates) => {
                setTableModel((tableModel) => ({ ...tableModel, findings: findingTemplates.data }));
                setEmptyResults((emptyResults) =>
                    0 === findingTemplates.data.length
                        ? emptyResults.concat("finding_templates")
                        : emptyResults.filter((value) => value !== "finding_templates"),
                );
            }).catch(ignoreAbortError);
        };

        reloadData();

        return () => controller.abort();
    }, [keywords, setTableModel, setEmptyResults]);

    if (tableModel.findings.length === 0) return <></>;

    return (
        <>
            <h3>{tableModel.findings.length} matching finding templates</h3>
            <FindingsTable tableModel={tableModel} tableModelSetter={setTableModel} showSelection={false} />
        </>
    );
};

export default FindingTemplatesSearchResults;
