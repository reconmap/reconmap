import { useCallback, useState } from "react";

type UseToggleReturn = { value: boolean; toggle: () => void; setToggle: (value: boolean) => void };

function useToggle(initialValue: boolean = false): UseToggleReturn {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => setValue((prev) => !prev), []);
    const setToggle = useCallback((value: boolean) => setValue(value), []);

    return { value, toggle, setToggle };
}

export default useToggle;
