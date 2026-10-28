import { createContext, useContext } from "react";

export type FormLayout = "horizontal" | "vertical";

const FormLayoutContext = createContext<FormLayout>("vertical");

export const useFormLayout = () => useContext(FormLayoutContext);

export default FormLayoutContext;
