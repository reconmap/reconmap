import NativeButton from "components/forms/NativeButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import { toast } from "components/ui/toast";
import { useState, type FormEvent } from "react";
import { requestEntityPost } from "utilities/requests";
import FindingCategoryForm from "./FindingCategoryForm";

const FindingCategoryAddModalDialog = ({ isOpen, onClose, onCancel }: any) => {
    const emptyCategory = { name: "", description: "" };
    const [newCategory, updateNewCategory] = useState(emptyCategory);

    const onCreateCategoryFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (!(document.getElementById("finding_category_form") as HTMLFormElement).checkValidity()) {
            return false;
        }

        event.preventDefault();

        requestEntityPost(`/findings/categories`, newCategory)
            .then(() => {
                onClose();
                toast.success(`The finding category has been created.`);
            })
            .finally(() => {
                updateNewCategory(emptyCategory);
            });
    };

    return (
        <ModalDialog visible={isOpen} onModalClose={onCancel} title="New finding category"
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

export default FindingCategoryAddModalDialog;
