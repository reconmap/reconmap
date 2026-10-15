import { useEffect, useRef } from "react";
import "./ModalDialog.css";

const ModalDialog = ({ title, children, visible, onModalClose, style = {} }: any) => {
    const htmlRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (visible) {
            if (!htmlRef.current?.open) htmlRef.current?.showModal();
        } else {
            htmlRef.current?.close();
        }
    }, [visible]);

    return (
        <dialog
            ref={htmlRef}
            className="html-dialog"
            onClose={onModalClose}
            // The dialog has no padding of its own (the content wrapper does), so a click whose target is
            // the dialog element itself can only have landed on the backdrop.
            onClick={(ev) => ev.target === ev.currentTarget && ev.currentTarget.close()}
            style={style}
        >
            <div className="html-dialog-content">
                <h4 className="title is-4">{title}</h4>
                <hr />

                {children}
            </div>
        </dialog>
    );
};

export default ModalDialog;
