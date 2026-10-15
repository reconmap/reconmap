import NativeButton from "components/forms/NativeButton";
import PrimaryButton from "components/ui/buttons/Primary";
import ModalDialog from "components/ui/ModalDialog";
import { actionCompletedToast } from "components/ui/toast";
import { useState } from "react";
import { requestEntityPut } from "utilities/requests";
import VulnerabilityCategoryForm from "./Form";

const VulnerabilityCategoryEditModalDialog = ({ category, isOpen, onClose, onCancel }: any) => {
    const [newCategory, updateNewCategory] = useState(category);

    const onCreateCategoryFormSubmit = (ev) => {
        /*
        if (!categoryForm.checkValidity()) {
            return false;
        }
        */
        ev.preventDefault();

        requestEntityPut(`/vulnerabilities/categories/${category.id}`, newCategory)
            .then(() => {
                onClose();
                actionCompletedToast(`The vulnerability category has been updated.`);
            })
            .finally(() => { });
    };

    return (
        <ModalDialog visible={isOpen} onClose={onCancel} title="Vulnerability category details">
            <div>
                <div>
                    <VulnerabilityCategoryForm
                        category={newCategory}
                        onFormSubmit={onCreateCategoryFormSubmit}
                        categorySetter={updateNewCategory}
                    />
                </div>

                <div>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton
                        type="submit"
                        form="vulnerability_category_form"
                        onClick={onCreateCategoryFormSubmit}
                    >
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default VulnerabilityCategoryEditModalDialog;
