import NativeButton from "components/forms/NativeButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import { toast } from "components/ui/toast";
import { useState, type FormEvent } from "react";
import { requestEntityPut } from "utilities/requests";
import FindingCategoryForm from "./FindingCategoryForm";

const FindingCategoryEditModalDialog = ({ category, isOpen, onClose, onCancel }: any) => {
    const [newCategory, updateNewCategory] = useState(category);

    const onCreateCategoryFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        /*
        if (!categoryForm.checkValidity()) {
            return false;
        }
        */
        event.preventDefault();

        requestEntityPut(`/findings/categories/${category.id}`, newCategory)
            .then(() => {
                onClose();
                toast.success(`The finding category has been updated.`);
            })
            .finally(() => { });
    };

    return (
        <ModalDialog visible={isOpen} onModalClose={onCancel} title="Finding category"
            footer={
                <>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton
                        type="submit"
                        form="finding_category_form"
                        onClick={onCreateCategoryFormSubmit}
                    >
                        Save
                    </PrimaryButton>
                </>
            }
        >
            <div>
                <div>
                    <FindingCategoryForm
                        category={newCategory}
                        onFormSubmit={onCreateCategoryFormSubmit}
                        categorySetter={updateNewCategory}
                    />
                </div>
            </div>
        </ModalDialog>
    );
};

export default FindingCategoryEditModalDialog;
