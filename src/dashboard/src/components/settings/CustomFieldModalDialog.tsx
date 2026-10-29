import { type FormEvent } from "react";
import { useSystemCustomFieldPostMutation } from "api/system";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";

const CustomFieldModalDialog = ({ isOpen, onClose }: any) => {
    const createCustomFieldMutation = useSystemCustomFieldPostMutation();

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());

        createCustomFieldMutation.mutate(data as any);

        form.reset();
        onClose();
    };

    return (
        <ModalDialog visible={isOpen} onModalClose={onClose} title="New custom field"
            footer={
                <>
                    <NativeButton onClick={onClose}>Cancel</NativeButton>
                    <PrimaryButton type="submit" form="custom-field-form">Save</PrimaryButton>
                </>
            }
        >
            <div>
                <Form layout="vertical" id="custom-field-form" onSubmit={onSubmit}>
                    <input type="hidden" name="config" value="{}" />

                    <FormField label="Name" control={<NativeInput type="text" name="name" required autoFocus />} />

                    <FormField
                        label="Type"
                        control={
                            <NativeSelect name="kind">
                                <option value="text">Text</option>
                                <option value="integer">Integer</option>
                                <option value="decimal">Decimal</option>
                            </NativeSelect>
                        }
                    />

                    <FormField label="Label" control={<NativeInput type="text" name="label" required />} />

                    <FormField
                        label="Parent type"
                        control={
                            <NativeSelect name="parentType">
                                <option value="vulnerability">Vulnerability</option>
                            </NativeSelect>
                        }
                    />
                </Form>
            </div>
        </ModalDialog>
    );
};

export default CustomFieldModalDialog;
