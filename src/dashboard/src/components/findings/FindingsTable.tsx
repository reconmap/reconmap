import { type ChangeEvent, type MouseEvent } from "react";
import { useDeleteFindingMutation } from "api/findings";
import NativeCheckbox from "components/forms/NativeCheckbox";
import RestrictedComponent from "components/logic/RestrictedComponent";
import ProjectBadge from "components/projects/ProjectBadge";
import AscendingSortLink from "components/ui/AscendingSortLink";
import DescendingSortLink from "components/ui/DescendingSortLink";
import Tags from "components/ui/Tags";
import DeleteButton from "components/ui/buttons/DeleteButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ReloadButton from "components/ui/buttons/ReloadButton";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResultsTableRow from "components/ui/tables/NoResultsTableRow";
import { toast } from "components/ui/toast";
import { useConfirm } from "components/ui/useConfirm";
import { useNavigate } from "react-router";
import { requestEntityPost } from "utilities/requests";
import CvssScore from "../badges/CvssScore";
import RiskBadge from "../badges/RiskBadge";
import FindingBadge from "../badges/FindingBadge";
import LinkButton from "../ui/buttons/LinkButton";
import FindingStatusBadge from "./FindingStatusBadge";
import FindingCategorySpan from "./categories/FindingCategorySpan";

const FindingsTable = ({
    tableModel,
    tableModelSetter: setTableModel,
    reloadCallback,
    showSelection = true,
    showProjectColumn = true,
}: any) => {
    const navigate = useNavigate();
    const { confirm, confirmDialog } = useConfirm();
    const onSortChange = (event: MouseEvent<HTMLElement>, column, order) => {
        event.preventDefault();

        setTableModel({
            ...tableModel,
            sortBy: { column: column, order: order },
        });
    };


    const cloneFinding = (event: MouseEvent<HTMLElement>, templateId) => {
        event.stopPropagation();

        requestEntityPost(`/findings/${templateId}/clone`)
            .then((resp) => resp.json())
            .then((data) => {
                navigate(`/findings/${data.findingId}/edit`);
            });
    };

    const onSelectionChange = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const selectionId = target.value;
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

    const onHeaderCheckboxClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setTableModel({
                ...tableModel,
                selection: tableModel.findings.map((finding) => finding.id),
            });
        } else {
            setTableModel({ ...tableModel, selection: [] });
        }
    };

    const deleteFindingMutation = useDeleteFindingMutation();

    const numColumns = 6 + (showSelection ? 1 : 0) + (showProjectColumn ? 1 : 0);
    const findingsLength = null !== tableModel.findings ? tableModel.findings.length : 0;

    const deleteFinding = async (findingId) => {
        if (await confirm("Do you really want to delete this finding?")) {
            try {
                await deleteFindingMutation.mutateAsync([findingId] as any);
                toast.success("The finding has been deleted.");
                if (reloadCallback) {
                    reloadCallback();
                }
            } catch {
                toast.error("An error occurred while deleting the finding.");
            }
        }
    };

    return (
        <>
        <table className="table is-fullwidth">
            <thead>
                <tr>
                    {showSelection && (
                        <th style={{ width: "32px" }}>
                            <NativeCheckbox
                                aria-label="Select all findings"
                                onChange={onHeaderCheckboxClick}
                                checked={
                                    tableModel.selection.length && tableModel.selection.length === findingsLength
                                }
                                disabled={tableModel.findingsLength === 0}
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
                        CVSS score{" "}
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
                {null === tableModel.findings && <LoadingTableRow numColumns={numColumns} />}
                {null !== tableModel.findings && 0 === tableModel.findings.length && (
                    <NoResultsTableRow numColumns={numColumns} />
                )}
                {null !== tableModel.findings &&
                    tableModel.findings.length > 0 &&
                    tableModel.findings.map((finding, index) => {
                        return (
                            <tr key={index}>
                                {showSelection && (
                                    <td>
                                        <NativeCheckbox
                                            aria-label="Select finding"
                                            value={finding.id}
                                            onChange={onSelectionChange}
                                            checked={tableModel.selection.includes(finding.id)}
                                        />
                                    </td>
                                )}
                                <td>
                                    <FindingBadge finding={finding} />
                                    <div>
                                        <Tags values={finding.tags} />
                                    </div>
                                </td>
                                {showProjectColumn && (
                                    <td>
                                        {finding.isTemplate ? (
                                            <span title="Not applicable">(n/a)</span>
                                        ) : (
                                            <ProjectBadge
                                                project={{
                                                    id: finding.projectId,
                                                    name: finding.project?.name,
                                                }}
                                            />
                                        )}
                                    </td>
                                )}
                                <td>
                                    <FindingStatusBadge finding={finding} />
                                </td>
                                <td>
                                    <RiskBadge risk={finding.risk} />
                                </td>
                                <td>
                                     <CvssScore score={finding.cvssScore} />
                                </td>
                                <td className="only-desktop">
                                    <FindingCategorySpan
                                        name={finding.category?.name}
                                        parentName={finding.parent_category_name}
                                    />
                                </td>
                                <td>
                                    <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                                        <LinkButton href={`/findings/${finding.id}/edit`}>Edit</LinkButton>
                                        {finding.isTemplate && <PrimaryButton
                                            onClick={(event: MouseEvent<HTMLElement>) => cloneFinding(event, finding.id)}
                                            key={finding.id}
                                            title="Clone"
                                        >
                                            Clone and edit
                                        </PrimaryButton>}
                                        {reloadCallback && (
                                            <DeleteButton display="icon" onClick={() => deleteFinding(finding.id)} />
                                        )}
                                    </RestrictedComponent>
                                </td>
                            </tr>
                        );
                    })}
            </tbody>
        </table>
        {confirmDialog}
        </>
    );
};

export default FindingsTable;
