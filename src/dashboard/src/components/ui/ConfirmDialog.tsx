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
                    <button type="button" className="button" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="button is-danger" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </>
            }
    >
        <p>{message}</p>
    </ModalDialog>
);

export default ConfirmDialog;
