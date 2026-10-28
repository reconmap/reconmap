import { ReactNode } from "react";
import styles from "./FormActions.module.css";

/**
 * Action buttons of a form: separated by a rule, right-aligned, secondary actions first and the positive action last.
 */
const FormActions = ({ children }: { children: ReactNode }) => <div className={styles.actions}>{children}</div>;

export default FormActions;
