import { useConfirm } from "components/ui/useConfirm";
import {
    useSystemCustomFieldDeletionMutation,
    useSystemCustomFieldsQuery,
} from "api/system";
import CustomFieldModalDialog from "components/settings/CustomFieldModalDialog";
import CreateButton from "components/ui/buttons/CreateButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const CustomFieldsPage = () => {
    const [t] = useTranslation();
    const { confirm, confirmDialog } = useConfirm();
    const { data: customFields } = useSystemCustomFieldsQuery();

    const deleteCustomFieldMutation = useSystemCustomFieldDeletionMutation();
    const [isCustomFieldDialogOpen, setIsCustomFieldDialogOpen] = useState(false);

    const onDeleteCustomFieldClick = async (ev, field) => {
        ev.preventDefault();

        if (!(await confirm(t("Are you sure you want to delete this custom field?")))) return;

        deleteCustomFieldMutation.mutate(field.id);
    };

    const columns = [
        { header: "Name", property: "name" },
        { header: "Label", property: "label" },
        { header: "Type", property: "kind" },
        { header: "Parent type", property: "parentType" },
        {
            header: "",
            property: "actions",
            cell: (field) => (
                <DeleteButton display="icon" onClick={(ev) => onDeleteCustomFieldClick(ev, field)} />
            ),
        },
    ];

    return (
        <>
            <div className="heading">
                <CreateButton onClick={() => setIsCustomFieldDialogOpen(true)}>New custom field</CreateButton>
            </div>
            <PageTitleHeader title={t("Custom fields")} subHeader={t("System")} />

            <NativeTable rows={customFields} rowId={(customField) => customField.id} columns={columns}>
            </NativeTable>
            <CustomFieldModalDialog isOpen={isCustomFieldDialogOpen} onClose={() => setIsCustomFieldDialogOpen(false)} />
            {confirmDialog}
        </>
    );
};

export default CustomFieldsPage;
