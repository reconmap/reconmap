import { useSystemCustomFieldPostMutation } from "api/system";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";

const CustomFieldModalDialog = ({ isOpen, onClose }: any) => {
    const createCustomFieldMutation = useSystemCustomFieldPostMutation();

    const onSubmit = (ev) => {
        ev.preventDefault();

        const form = ev.target;
        const data = Object.fromEntries(new FormData(form).entries());

        createCustomFieldMutation.mutate(data as any);

        form.reset();
        onClose();
    };

    return (
        <ModalDialog visible={isOpen} onModalClose={onClose} title="New custom field">
            <div>
                <form id="custom-field-form" onSubmit={onSubmit}>
                    <input type="hidden" name="config" value="{}" />

                    <HorizontalLabelledField label="Name" control={<NativeInput type="text" name="name" required autoFocus />} />

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
                </form>

                <div>
                    <NativeButton onClick={onClose}>Cancel</NativeButton>
                    <PrimaryButton type="submit" form="custom-field-form">Save</PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default CustomFieldModalDialog;
