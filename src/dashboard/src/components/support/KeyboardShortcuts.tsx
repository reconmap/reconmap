import ModalDialog from "components/ui/ModalDIalog";
import { useCallback, useEffect, useState } from "react";
import isInputElement from "utilities/domUtils";
import "./KeyboardShortcuts.css";

const KeyboardShortcuts = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const onKeyDownListener = useCallback(
        (ev) => {
            if (isInputElement(document.activeElement)) {
                return;
            }

            if (ev.key === "?") {
                ev.preventDefault();

                setModalVisible(!modalVisible);
            }
        },
        [modalVisible],
    );

    const onModalClose = () => {
        setModalVisible(false);
    };

    useEffect(() => {
        document.addEventListener("keydown", onKeyDownListener);
        return () => {
            document.removeEventListener("keydown", onKeyDownListener);
        };
    }, [onKeyDownListener]);

    return (
        <ModalDialog
            title="Keyboard shortcuts"
            visible={modalVisible}
            onModalClose={onModalClose}
            style={{ maxWidth: "500px" }}
        >
            <div className="KeyboardShortcutsPopup content">
                <h4>General</h4>
                <ul>
                    <li>
                        Show/Hide keyboard shortcuts
                        <kbd>?</kbd>
                    </li>
                    <li>
                        Search
                        <kbd>/</kbd>
                    </li>
                </ul>
                <hr />

                <h4>Pagination</h4>
                <ul>
                    <li>
                        Previous page
                        <kbd>p</kbd>
                    </li>
                    <li>
                        Next page
                        <kbd>n</kbd>
                    </li>
                </ul>
            </div>
        </ModalDialog>
    );
};

export default KeyboardShortcuts;
