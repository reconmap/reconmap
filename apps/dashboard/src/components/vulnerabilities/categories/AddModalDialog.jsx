import NativeButton from "components/form/NativeButton";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import ModalDialog from "components/ui/ModalDIalog.jsx";
import { actionCompletedToast } from "components/ui/toast";
import { useState } from "react";
import { requestEntityPost } from "utilities/requests.js";
import VulnerabilityCategoryForm from "./Form";

const VulnerabilityCategoryAddModalDialog = ({ isOpen, onClose, onCancel }) => {
    const emptyCategory = { name: "", description: "" };
    const [newCategory, updateNewCategory] = useState(emptyCategory);

    const onCreateCategoryFormSubmit = (ev) => {
        if (!document.getElementById("vulnerability_category_form").checkValidity()) {
            return false;
        }

        ev.preventDefault();

        requestEntityPost(`/vulnerabilities/categories`, newCategory)
            .then(() => {
                onClose();
                actionCompletedToast(`The vulnerability category has been created.`);
            })
            .finally(() => {
                updateNewCategory(emptyCategory);
            });
    };

    return (
        <ModalDialog visible={isOpen} onClose={onCancel} title="New vulnerability category">
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

export default VulnerabilityCategoryAddModalDialog;
