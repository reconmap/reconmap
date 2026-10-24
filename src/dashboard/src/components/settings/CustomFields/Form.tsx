import {
    useSystemCustomFieldDeletionMutation,
    useSystemCustomFieldPostMutation,
    useSystemCustomFieldsQuery,
} from "api/system";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import DeleteIconButton from "components/ui/buttons/DeleteIconButton";
import PrimaryButton from "components/ui/buttons/Primary";
import NativeTable from "components/ui/tables/NativeTable";
import PageTitleHeader from "components/ui/PageTitleHeader";
import { useTranslation } from "react-i18next";

const CustomFieldsPage = () => {
    const [t] = useTranslation();
    const { data: customFields } = useSystemCustomFieldsQuery();

    const deleteCustomFieldMutation = useSystemCustomFieldDeletionMutation();
    const createCustomFieldMutation = useSystemCustomFieldPostMutation();

    const onDeleteCustomFieldClick = (ev, field) => {
        ev.preventDefault();

        deleteCustomFieldMutation.mutate(field.id);
    };

    const onAddCustomFieldSubmit = (ev) => {
        ev.preventDefault();

        const formData = new FormData(ev.target);
        const data = Object.fromEntries(formData.entries());

        createCustomFieldMutation.mutate(data as any);

        ev.target.reset();

        return false;
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
                <DeleteIconButton onClick={(ev) => onDeleteCustomFieldClick(ev, field)} />
            ),
        },
    ];

    return (
        <>
            <PageTitleHeader title={t("Custom fields")} subHeader={t("System")} />

            <form onSubmit={onAddCustomFieldSubmit}>
                <input type="hidden" name="config" value="{}" />

                <HorizontalLabelledField label="Name" control={<NativeInput type="text" name="name" required />} />

                <HorizontalLabelledField
                    label="Type"
                    control={
                        <NativeSelect name="kind">
                            <option value="text">Text</option>
                            <option value="integer">Integer</option>
                            <option value="decimal">Decimal</option>
                        </NativeSelect>
                    }
                />

                <HorizontalLabelledField label="Label" control={<NativeInput type="text" name="label" required />} />

                <HorizontalLabelledField
                    label="Parent type"
                    control={
                        <NativeSelect name="parentType">
                            <option value="vulnerability">Vulnerability</option>
                        </NativeSelect>
                    }
                />

                <hr />
                <HorizontalLabelledField control={<PrimaryButton type="submit">Save</PrimaryButton>} />
            </form>

            <NativeTable rows={customFields} rowId={(customField) => customField.id} columns={columns}>
            </NativeTable>
        </>
    );
};

export default CustomFieldsPage;
