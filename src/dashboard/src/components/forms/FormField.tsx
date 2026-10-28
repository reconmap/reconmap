import { ReactNode } from "react";
import { FormLayout, useFormLayout } from "./FormLayoutContext";

interface FormFieldProps {
    htmlFor?: string;
    label?: ReactNode;
    control: ReactNode;
    layout?: FormLayout;
}

const FormField = ({ htmlFor, label = "", control, layout }: FormFieldProps) => {
    const formLayout = useFormLayout();

    if ((layout ?? formLayout) === "horizontal") {
        return (
            <div className="field is-horizontal">
                <div className="field-label">
                    {label !== "" && (
                        <label className="label" htmlFor={htmlFor}>
                            {label}
                        </label>
                    )}
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className="control">{control}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="field">
            {label !== "" && (
                <label className="label" htmlFor={htmlFor}>
                    {label}
                </label>
            )}
            <div className="control">{control}</div>
        </div>
    );
};

export default FormField;
