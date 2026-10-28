import FormField from "./FormField";
import NativeInput from "./NativeInput";

const DynamicForm = ({ fields }: any) => {
    return fields.map((field) => {
        const key = `customField-${field.name}`;
        if (["text"].includes(field.kind)) {
            return (
                <FormField
                    key={key}
                    htmlFor={field.name}
                    label={field.label}
                    control={<NativeInput id={field.name} type={field.kind} name={field.name} />}
                />
            );
        }
        if (["integer"].includes(field.kind)) {
            return (
                <FormField
                    key={key}
                    htmlFor={field.name}
                    label={field.label}
                    control={<NativeInput id={field.name} type="number" name={field.name} />}
                />
            );
        }
        if (["decimal"].includes(field.kind)) {
            return (
                <FormField
                    key={key}
                    htmlFor={field.name}
                    label={field.label}
                    control={<NativeInput id={field.name} type="number" name={field.name} step="0.001" />}
                />
            );
        }
    });
};

export default DynamicForm;
