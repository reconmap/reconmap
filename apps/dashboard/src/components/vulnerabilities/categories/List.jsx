import { useDeleteVulnerabilityCategoryMutation, useVulnerabilityCategoriesQuery } from "api/vulnerabilities.js";
import Breadcrumb from "components/ui/Breadcrumb";
import Loading from "components/ui/Loading.jsx";
import NoResults from "components/ui/NoResults";
import Title from "components/ui/Title";
import CreateButton from "components/ui/buttons/Create";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import LinkButton from "components/ui/buttons/Link";
import useBoolean from "hooks/useBoolean";
import { useState } from "react";
import { Link } from "react-router-dom";
import VulnerabilityCategoryAddModalDialog from "./AddModalDialog";
import VulnerabilityCategoryEditModalDialog from "./EditModalDialog";

const VulnerabilityCategoriesPage = () => {
    const { data: categories, isLoading, refetch } = useVulnerabilityCategoriesQuery({ parentsOnly: false });
    const deleteVulnerabilityCategoryMutation = useDeleteVulnerabilityCategoryMutation();

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

    const onAddClick = (ev) => {
        ev.preventDefault();

        openAddCategoryDialog();
    };

    const onEditClick = (ev, ccategory) => {
        ev.preventDefault();

        setEditCategory(ccategory);
        openEditCategoryDialog();
    };

    const onDeleteClick = (ev, templateId) => {
        ev.stopPropagation();

        deleteVulnerabilityCategoryMutation.mutate(templateId);
    };

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="heading">
                <Breadcrumb>
                    <Link to="/vulnerabilities">Vulnerabilities</Link>
                </Breadcrumb>

                <VulnerabilityCategoryAddModalDialog
                    isOpen={isAddCategoryDialogOpen}
                    onClose={onCategoryDialogClosed}
                    onCancel={closeAddCategoryDialog}
                />
                {isEditCategoryDialogOpen && (
                    <VulnerabilityCategoryEditModalDialog
                        category={editCategory}
                        isOpen={isEditCategoryDialogOpen}
                        onClose={onCategoryDialogClosed}
                        onCancel={closeEditCategoryDialog}
                    />
                )}
                <CreateButton onClick={onAddClick}>Add vulnerability category&hellip;</CreateButton>
            </div>
            <Title title="Vulnerability categories" />

            <table className="table is-fullwidth">
                <thead>
                    <tr>
                        <th style={{ width: "190px" }}>Name</th>
                        <th>Parent category</th>
                        <th colSpan={2}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {null === categories || categories.length === 0 ? (
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
                                    <LinkButton href="#" onClick={(ev) => onEditClick(ev, category)}>
                                        Edit
                                    </LinkButton>
                                    <DeleteIconButton onClick={(ev) => onDeleteClick(ev, category.id)} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
};

export default VulnerabilityCategoriesPage;
