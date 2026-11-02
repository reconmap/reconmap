import { useEffect, useRef, useSyncExternalStore } from "react";
import { getToasts, subscribeToasts, toast } from "./toast";
import styles from "./Toaster.module.css";

export default function Toaster() {
    const items = useSyncExternalStore(subscribeToasts, getToasts);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasItems = items.length > 0;

    // A manual popover lives in the browser top layer, so toasts stay visible above open modal dialogs.
    useEffect(() => {
        const container = containerRef.current;
        if (!container?.showPopover) return;
        if (hasItems && !container.matches(":popover-open")) container.showPopover();
        else if (!hasItems && container.matches(":popover-open")) container.hidePopover();
    }, [hasItems]);

    return (
        <div ref={containerRef} popover="manual" className={styles.toaster}>
            {items.map(({ id, type, message }) => (
                <div
                    key={id}
                    className={`notification is-light ${type === "success" ? "is-success" : "is-danger"} ${styles.toast}`}
                    role={type === "error" ? "alert" : "status"}
                >
                    <button type="button" className="delete" aria-label="Dismiss" onClick={() => toast.dismiss(id)} />
                    {message}
                </div>
            ))}
        </div>
    );
}
