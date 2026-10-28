import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";

type PendingConfirmation = { message: string; resolve: (confirmed: boolean) => void };

/**
 * Replacement for `window.confirm`. Render `confirmDialog` once in the component and
 * `await confirm(message)` where the confirmation is needed.
 */
export const useConfirm = () => {
    const [t] = useTranslation();
    const [pending, setPending] = useState<PendingConfirmation | null>(null);
    const pendingRef = useRef<PendingConfirmation | null>(null);

    const settle = useCallback((confirmed: boolean) => {
        pendingRef.current?.resolve(confirmed);
        pendingRef.current = null;
        setPending(null);
    }, []);

    const confirm = useCallback(
        (message: string) =>
            new Promise<boolean>((resolve) => {
                pendingRef.current?.resolve(false);
                pendingRef.current = { message, resolve };
                setPending(pendingRef.current);
            }),
        [],
    );

    const confirmDialog = (
        <ConfirmDialog
            title={t("Confirm")}
            message={pending?.message ?? ""}
            visible={pending !== null}
            confirmLabel={t("Delete")}
            cancelLabel={t("Cancel")}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
        />
    );

    return { confirm, confirmDialog };
};
