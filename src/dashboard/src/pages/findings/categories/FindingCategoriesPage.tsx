import { useConfirm } from "components/ui/useConfirm";
import { useDeleteFindingCategoryMutation, useFindingCategoriesQuery } from "api/findings";
import Breadcrumb from "components/ui/Breadcrumb";
import LoadingTableRow from "components/ui/tables/LoadingTableRow";
import NoResults from "components/ui/NoResults";
import PageTitleHeader from "components/ui/PageTitleHeader";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import LinkButton from "components/ui/buttons/LinkButton";
import useBoolean from "hooks/useBoolean";
import { useState, type MouseEvent } from "react";
import { Link } from "react-router";
import FindingCategoryAddModalDialog from "components/findings/categories/FindingCategoryAddModalDialog";
import FindingCategoryEditModalDialog from "components/findings/categories/FindingCategoryEditModalDialog";
import { useTranslation } from "react-i18next";

const FindingCategoriesPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const { data: categories, isLoading, refetch } = useFindingCategoriesQuery({ parentsOnly: false });
    const deleteFindingCategoryMutation = useDeleteFindingCategoryMutation();

    const [editCategory, setEditCategory] = useState({});

    const {
        value: isAddCategoryDialogOpen,
        setTrue: openAddCategoryDialog,
        setFalse: closeAddCategoryDialog,
    } = useBoolean();
    const {
        value: isEditCategoryDialogOpen,
        setTrue: openEditCategoryDialog,
        setFalse: closeEditCategoryDialog,
    } = useBoolean();

    const onCategoryDialogClosed = () => {
        refetch();

        closeAddCategoryDialog();
        closeEditCategoryDialog();
    };

    const onAddClick = (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();

        openAddCategoryDialog();
    };

    const onEditClick = (event: MouseEvent<HTMLElement>, ccategory) => {
        event.preventDefault();

        setEditCategory(ccategory);
        openEditCategoryDialog();
    };

    const onDeleteClick = async (event: MouseEvent<HTMLElement>, templateId) => {
        event.stopPropagation();

        if (!(await confirm(t("Are you sure you want to delete this category?")))) return;

        deleteFindingCategoryMutation.mutate(templateId);
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/findings">Findings</Link>
                </Breadcrumb>

                <FindingCategoryAddModalDialog
                    isOpen={isAddCategoryDialogOpen}
                    onClose={onCategoryDialogClosed}
                    onCancel={closeAddCategoryDialog}
                />
                {isEditCategoryDialogOpen && (
                    <FindingCategoryEditModalDialog
                        category={editCategory}
                        isOpen={isEditCategoryDialogOpen}
                        onClose={onCategoryDialogClosed}
                        onCancel={closeEditCategoryDialog}
                    />
                )}
                <CreateButton onClick={onAddClick}>New finding category&hellip;</CreateButton>
            </div>
            <PageTitleHeader title={t("Finding categories")} />

            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th style={{ width: "190px" }}>Name</th>
                        <th>Parent category</th>
                        <th colSpan={2}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <LoadingTableRow numColumns={3} />
                    ) : !categories || categories.length === 0 ? (
                        <tr>
                            <td colSpan={3}>
                                <NoResults />
                            </td>
                        </tr>
                    ) : (
                        categories.map((category) => (
                            <tr key={category.id}>
                                <td>
                                    <strong>{category.name}</strong>
                                </td>
                                <td>{category.parent_name ?? "-"}</td>
                                <td>{category.description}</td>
                                <td>
                                    <LinkButton href="#" onClick={(event: MouseEvent<HTMLElement>) => onEditClick(event, category)}>
                                        Edit&hellip;
                                    </LinkButton>
                                    <DeleteButton display="icon" onClick={(event) => onDeleteClick(event, category.id)} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {confirmDialog}
        </>
    );
};

export default FindingCategoriesPage;
