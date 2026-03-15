import { useAssetsQuery, useDeleteAssetMutation } from "api/assets.js";
import PaginationV2 from "components/layout/PaginationV2";
import RestrictedComponent from "components/logic/RestrictedComponent";
import TargetModalDialog from "components/target/ModalDialog";
import TargetBadge from "components/target/TargetBadge";
import Tags from "components/ui/Tags";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import NativeTable from "components/ui/tables/NativeTable.jsx";
import useBoolean from "hooks/useBoolean";
import useQuery from "hooks/useQuery";
import { useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../ui/Loading";

const ProjectTargets = ({ project }) => {
    const query = useQuery();
    const urlPageNumber = query.get("page") !== null ? parseInt(query.get("page")) : 1;
    const [pageNumber, setPageNumber] = useState(urlPageNumber);

    const { value: isAddTargetDialogOpen, setTrue: openAddTargetDialog, setFalse: closeAddTargetDialog } = useBoolean();
    const {
        data: targets,
        isLoading,
        refetch,
    } = useAssetsQuery({ limit: 5, projectId: project.id, page: pageNumber - 1 });
    const deleteAssetMutation = useDeleteAssetMutation();

    const onDeleteButtonClick = (ev, targetId) => {
        ev.preventDefault();

        deleteAssetMutation.mutate(targetId);
        refetch();
    };

    const onTargetFormSaved = () => {
        refetch();
        closeAddTargetDialog();
    };

    const onPageChange = (pageNumber) => {
        setPageNumber(pageNumber + 1);
    };

    const columns = [
        {
            header: "Name",
            cell: (target) => <>
                {!target.parent_id && (
                    <Link to={`/targets/${target.id}`}>
                        <TargetBadge name={target.name} />
                    </Link>
                )}
                {target.parent_id !== null && <>{target.parent?.name}</>}
            </>
        },
        {
            header: "Sub-target",
            cell: (target) => (
                <>
                    {target.parent_id ? (
                        <>
                            <Link to={`/targets/${target.id}`}>
                                <TargetBadge name={target.name} />
                            </Link>
                        </>
                    ) : (
                        "-"
                    )}
                </>
            )
        },
        {
            header: "Kind",
            cell: (target) => (
                <>
                    {target.kind} <Tags values={target.tags} />
                </>
            )
        },
        {
            header: "Vulnerable?",
            cell: (target) => (
                <>
                    {target.num_vulnerabilities > 0
                        ? `Yes (${target.num_vulnerabilities} vulnerabilities found)`
                        : "No"}
                </>
            )
        },
        {
            header: "",
            cell: (target) => (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <DeleteIconButton onClick={(ev) => onDeleteButtonClick(ev, target.id)} />
                </RestrictedComponent>
            )
        }
    ]

    return (
        <section>
            <h4 className="title is-4">Assets</h4>
            {!project.archived && (
                <RestrictedComponent roles={["administrator", "superuser", "user"]}>
                    <TargetModalDialog
                        project={project}
                        isOpen={isAddTargetDialogOpen}
                        onSubmit={onTargetFormSaved}
                        onCancel={closeAddTargetDialog}
                    />
                    <CreateButton onClick={openAddTargetDialog}>Add asset&hellip;</CreateButton>
                </RestrictedComponent>
            )}
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {targets.pageCount > 1 && (
                        <center>
                            <PaginationV2 page={pageNumber - 1} total={targets.pageCount} onPageChange={onPageChange} />
                        </center>
                    )}
                    <NativeTable rows={targets.data} rowId={(target) => target.id} columns={columns}>
                    </NativeTable>
                </>
            )}
        </section>
    );
};

export default ProjectTargets;
