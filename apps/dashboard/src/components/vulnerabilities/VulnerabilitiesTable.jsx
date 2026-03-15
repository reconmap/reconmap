import { useDeleteVulnerabilityMutation } from "api/vulnerabilities.js";
import NativeCheckbox from "components/form/NativeCheckbox";
import RestrictedComponent from "components/logic/RestrictedComponent";
import ProjectBadge from "components/projects/ProjectBadge";
import AscendingSortLink from "components/ui/AscendingSortLink";
import DescendingSortLink from "components/ui/DescendingSortLink";
import Tags from "components/ui/Tags";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import ReloadButton from "components/ui/buttons/Reload";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import { actionCompletedToast } from "components/ui/toast.jsx";
import CvssScore from "../badges/CvssScore";
import RiskBadge from "../badges/RiskBadge";
import VulnerabilityBadge from "../badges/VulnerabilityBadge";
import LinkButton from "../ui/buttons/Link";
import VulnerabilityStatusBadge from "./StatusBadge";
import VulnerabilityCategorySpan from "./categories/Span";

const VulnerabilitiesTable = ({
    tableModel,
    tableModelSetter: setTableModel,
    reloadCallback,
    showSelection = true,
    showProjectColumn = true,
}) => {
    const onSortChange = (ev, column, order) => {
        ev.preventDefault();

        setTableModel({
            ...tableModel,
            sortBy: { column: column, order: order },
        });
    };

    const onSelectionChange = (ev) => {
        const target = ev.target;
        const selectionId = parseInt(target.value);
        if (target.checked) {
            setTableModel({
                ...tableModel,
                selection: [...tableModel.selection, selectionId],
            });
        } else {
            setTableModel({
                ...tableModel,
                selection: tableModel.selection.filter((value) => value !== selectionId),
            });
        }
    };

    const onHeaderCheckboxClick = (ev) => {
        if (ev.target.checked) {
            setTableModel({
                ...tableModel,
                selection: tableModel.vulnerabilities.map((vulnerability) => vulnerability.id),
            });
        } else {
            setTableModel({ ...tableModel, selection: [] });
        }
    };

    const deleteVulnerabilityMutation = useDeleteVulnerabilityMutation();

    const numColumns = 6 + (showSelection ? 1 : 0) + (showProjectColumn ? 1 : 0);
    const vulnerabilitiesLength = null !== tableModel.vulnerabilities ? tableModel.vulnerabilities.length : 0;

    const deleteVulnerability = async (vulnerabilityId) => {
        if (window.confirm("Do you really want to delete this vulnerability?")) {
            try {
                await deleteVulnerabilityMutation.mutateAsync([vulnerabilityId]);
                actionCompletedToast("The vulnerability has been deleted.");
                if (reloadCallback) {
                    reloadCallback();
                }
            } catch (error) {
                alert("An error occurred while deleting the vulnerability.");
            }
        }
    };

    return (
        <table className="table is-fullwidth">
            <thead>
                <tr>
                    {showSelection && (
                        <th style={{ width: "32px" }}>
                            <NativeCheckbox
                                onChange={onHeaderCheckboxClick}
                                checked={
                                    tableModel.selection.length && tableModel.selection.length === vulnerabilitiesLength
                                }
                                disabled={tableModel.vulnerabilitiesLength === 0}
                            />
                        </th>
                    )}
                    <th style={{ width: "190px" }}>Summary</th>
                    {showProjectColumn && <th style={{ width: "190px" }}>Project</th>}
                    <th style={{ width: "120px" }}>
                        <DescendingSortLink callback={onSortChange} property="status" /> Status{" "}
                        <AscendingSortLink callback={onSortChange} property="status" />
                    </th>
                    <th style={{ width: "120px" }}>
                        <DescendingSortLink callback={onSortChange} property="risk" /> Risk{" "}
                        <AscendingSortLink callback={onSortChange} property="risk" />
                    </th>
                    <th style={{ width: "70px" }}>
                        <DescendingSortLink callback={onSortChange} property="cvss_score" />{" "}
                        <abbr title="Common Vulnerability Scoring System">CVSS</abbr> score{" "}
                        <AscendingSortLink callback={onSortChange} property="cvss_score" />
                    </th>
                    <th className="only-desktop" style={{ width: "20%" }}>
                        <DescendingSortLink callback={onSortChange} property="category_name" /> Category{" "}
                        <AscendingSortLink callback={onSortChange} property="category_name" />
                    </th>
                    <th style={{ width: "15%", textAlign: "right" }}>
                        <ReloadButton onClick={reloadCallback} />
                    </th>
                </tr>
            </thead>
            <tbody>
                {null === tableModel.vulnerabilities && <LoadingTableRow numColumns={numColumns} />}
                {null !== tableModel.vulnerabilities && 0 === tableModel.vulnerabilities.length && (
                    <NoResultsTableRow numColumns={numColumns} />
                )}
                {null !== tableModel.vulnerabilities &&
                    tableModel.vulnerabilities.length > 0 &&
                    tableModel.vulnerabilities.map((vulnerability, index) => {
                        return (
                            <tr key={index}>
                                {showSelection && (
                                    <td>
                                        <NativeCheckbox
                                            value={vulnerability.id}
                                            onChange={onSelectionChange}
                                            checked={tableModel.selection.includes(vulnerability.id)}
                                        />
                                    </td>
                                )}
                                <td>
                                    <VulnerabilityBadge vulnerability={vulnerability} />
                                    <div>
                                        <Tags values={vulnerability.tags} />
                                    </div>
                                </td>
                                {showProjectColumn && (
                                    <td>
                                        {vulnerability.isTemplate ? (
                                            <span title="Not applicable">(n/a)</span>
                                        ) : (
                                            <ProjectBadge
                                                project={{
                                                    id: vulnerability.projectId,
                                                    name: vulnerability.project?.name,
                                                }}
                                            />
                                        )}
                                    </td>
                                )}
                                <td>
                                    <VulnerabilityStatusBadge vulnerability={vulnerability} />
                                </td>
                                <td>
                                    <RiskBadge risk={vulnerability.risk} />
                                </td>
                                <td>
                                    <CvssScore score={vulnerability.cvssScore} />
                                </td>
                                <td className="only-desktop">
                                    <VulnerabilityCategorySpan
                                        name={vulnerability.category?.name}
                                        parentName={vulnerability.parent_category_name}
                                    />
                                </td>
                                <td>
                                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                                        <LinkButton href={`/vulnerabilities/${vulnerability.id}/edit`}>Edit</LinkButton>
                                        {reloadCallback && (
                                            <DeleteIconButton onClick={() => deleteVulnerability(vulnerability.id)} />
                                        )}
                                    </RestrictedComponent>
                                </td>
                            </tr>
                        );
                    })}
            </tbody>
        </table>
    );
};

export default VulnerabilitiesTable;
