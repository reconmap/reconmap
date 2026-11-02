import { type ChangeEvent } from "react";
import { useFindingCategoriesQuery } from "api/findings";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";

const FindingCategoryForm = ({ category, onFormSubmit, categorySetter: setCategory }: any) => {
    const { data: categories } = useFindingCategoriesQuery({ parentsOnly: true });

    const onFormInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        const value = target.value === "" ? null : target.value;

        setCategory({ ...category, [name]: value });
    };

    return (
        <Form layout="vertical" id="finding_category_form" onSubmit={onFormSubmit}>
            <div id="parent_id">
                {categories && (
                    <FormField
                        label="Parent category"
                        control={
                            <NativeSelect name="parent_id" value={category.parent_id} onChange={onFormInputChange}>
                                <option>(none)</option>
                                {categories
                                    .filter((category) => category.parent_id === null)
                                    .map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                            </NativeSelect>
                        }
                    />
                )}
            </div>
            <div id="name">
                <FormField
                    label="Name"
                    control={
                        <NativeInput
                            name="name"
                            autoFocus
                            value={category.name}
                            onChange={onFormInputChange}
                            required
                        />
                    }
                />
            </div>
            <div id="description">
                <FormField
                    label="Description"
                    control={
                        <NativeInput name="description" value={category.description} onChange={onFormInputChange} />
                    }
                />
            </div>
        </Form>
    );
};

export default FindingCategoryForm;
