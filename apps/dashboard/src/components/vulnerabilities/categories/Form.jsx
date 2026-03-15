import { useVulnerabilityCategoriesQuery } from "api/vulnerabilities.js";
import LabelledField from "components/form/LabelledField";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";

const VulnerabilityCategoryForm = ({ category, onFormSubmit, categorySetter: setCategory }) => {
    const { data: categories } = useVulnerabilityCategoriesQuery({ parentsOnly: true });

    const onFormInputChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value === "" ? null : target.value;

        setCategory({ ...category, [name]: value });
    };

    return (
        <form id="vulnerability_category_form" onSubmit={onFormSubmit}>
            <div id="parent_id">
                {categories && (
                    <LabelledField
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
                <LabelledField
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
                <LabelledField
                    label="Description"
                    control={
                        <NativeInput name="description" value={category.description} onChange={onFormInputChange} />
                    }
                />
            </div>
        </form>
    );
};

export default VulnerabilityCategoryForm;
