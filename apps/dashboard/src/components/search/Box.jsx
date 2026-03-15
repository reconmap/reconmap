import NativeInput from "components/form/NativeInput";
import { createRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import isInputElement from "../../utilities/domUtils";

const SearchBox = () => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const inputRef = createRef();

    const onKeyDownListener = useCallback(
        (ev) => {
            if (!isInputElement(document.activeElement) && ev.key === "/") {
                ev.preventDefault();

                inputRef.current.select();
                inputRef.current.focus();
            }
        },
        [inputRef],
    );

    useEffect(() => {
        document.addEventListener("keydown", onKeyDownListener);
        return () => {
            document.removeEventListener("keydown", onKeyDownListener);
        };
    }, [onKeyDownListener]);

    const handleSearchKeyDown = (ev) => {
        const inputField = ev.target;
        const trimmedValue = inputField.value.trim();
        if (ev.key === "Enter" && trimmedValue.length > 0) {
            navigate("/search/" + encodeURIComponent(trimmedValue));
        }
    };

    return (
        <NativeInput
            className="input is-rounded"
            ref={inputRef}
            type="search"
            placeholder={t("Search...")}
            onKeyDown={handleSearchKeyDown}
        />
    );
};

export default SearchBox;
