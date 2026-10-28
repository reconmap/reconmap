import { FormHTMLAttributes } from "react";
import FormLayoutContext, { FormLayout } from "./FormLayoutContext";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
    layout?: FormLayout;
}

const Form = ({ layout = "vertical", children, ...formProps }: FormProps) => {
    return (
        <FormLayoutContext.Provider value={layout}>
            <form {...formProps}>{children}</form>
        </FormLayoutContext.Provider>
    );
};

export default Form;
