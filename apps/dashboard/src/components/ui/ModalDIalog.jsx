import { useEffect, useRef } from "react";
import "./ModalDialog.css";

const ModalDialog = ({ title, children, visible, onModalClose, style = {} }) => {
    const htmlRef = useRef(null);

    const closeDialog = (ev) => {
        htmlRef.current?.close();
    };

    const isClickInsideRectangle = (ev, element) => {
        if (["OPTION", "SELECT"].includes(ev.target.nodeName)) return true;

        const r = element.getBoundingClientRect();

        return ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
    };

    useEffect(() => {
        htmlRef.current?.addEventListener("close", onModalClose);
        return () => htmlRef.current?.removeEventListener("close", onModalClose);
    }, [onModalClose]);

    useEffect(() => {
        if (visible) {
            htmlRef.current?.showModal();
        } else {
            htmlRef.current?.close();
        }
    }, [visible]);

    return (
        <dialog
            ref={htmlRef}
            className="html-dialog"
            onClick={(ev) => htmlRef.current && !isClickInsideRectangle(ev, htmlRef.current) && closeDialog()}
            style={style}
        >
            <h4 className="title is-4">{title}</h4>
            <hr />

            {children}
        </dialog>
    );
};

export default ModalDialog;
