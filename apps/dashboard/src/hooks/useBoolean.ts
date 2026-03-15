import { useCallback, useState } from "react";

type UseBooleanReturn = {
    value: boolean;
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
};

export default function useBoolean(initialValue: boolean = false): UseBooleanReturn {
    const [value, setValue] = useState<boolean>(initialValue);

    const toggle = useCallback(() => setValue((prev) => !prev), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    return { value, toggle, setTrue, setFalse };
}
