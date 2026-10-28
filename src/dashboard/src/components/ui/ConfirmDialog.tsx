import NativeButton from "components/forms/NativeButton";
import DeleteButton from "components/ui/buttons/DeleteButton";
import ModalDialog from "./ModalDialog";

type ConfirmDialogProps = {
    title: string;
    message: string;
    visible: boolean;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog = ({ title, message, visible, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) => (
    <ModalDialog title={title} visible={visible} onModalClose={onCancel} 
        style={{ width: "30em", maxWidth: "90%" }}
            footer={
                <>
                    <NativeButton type="button" onClick={onCancel}>
                        {cancelLabel}
                    </NativeButton>
                    <DeleteButton onClick={onConfirm}>{confirmLabel}</DeleteButton>
                </>
            }
    >
        <p>{message}</p>
    </ModalDialog>
);

export default ConfirmDialog;
