import { FormHTMLAttributes } from "react";
import styles from "./Form.module.css";
import FormLayoutContext, { FormLayout } from "./FormLayoutContext";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: FormLayout;
}

const Form = ({
  layout = "vertical",
  className,
  children,
  ...formProps
}: FormProps) => {
  return (
    <FormLayoutContext.Provider value={layout}>
      <form
        {...formProps}
        className={
          [layout === "horizontal" && styles.horizontal, className]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        {children}
      </form>
    </FormLayoutContext.Provider>
  );
};

export default Form;
