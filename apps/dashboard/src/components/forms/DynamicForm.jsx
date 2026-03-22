import NativeInput from "./NativeInput";

const DynamicForm = ({ fields }) => {
    return fields.map((field) => {
        if (["text"].includes(field.kind)) {
            return (
                <div key={`customField-${field.name}`}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <NativeInput id={field.name} type={field.kind} name={field.name} />
                </div>
            );
        }
        if (["integer"].includes(field.kind)) {
            return (
                <div key={`customField-${field.name}`}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <NativeInput id={field.name} type="number" name={field.name} />
                </div>
            );
        }
        if (["decimal"].includes(field.kind)) {
            return (
                <div key={`customField-${field.name}`}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <NativeInput id={field.name} type="number" name={field.name} step="0.001" />
                </div>
            );
        }
    });
};

export default DynamicForm;
