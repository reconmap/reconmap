import { requestAssetPost } from "api/requests/assets.js";
import NativeButton from "components/form/NativeButton";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import ModalDialog from "components/ui/ModalDIalog.jsx";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import TargetIcon from "images/icons/target.svg?react";
import TargetKinds from "models/TargetKinds";
import { useState } from "react";
import TargetForm from "./Form";

const TargetModalDialog = ({ project, isOpen, onSubmit, onCancel }) => {
    const emptyTarget = {
        projectId: project.id,
        name: null,
        kind: TargetKinds[0].value,
    };
    const [target, setTarget] = useState(emptyTarget);

    const onAddTargetFormSubmit = (ev) => {
        ev.preventDefault();

        requestAssetPost(target)
            .then(() => {
                onSubmit();
                actionCompletedToast(`The target "${target.name}" has been added.`);
            })
            .catch((err) => {
                errorToast(err);
            })
            .finally(() => {
                setTarget(emptyTarget);
            });
    };

    return (
        <ModalDialog
            visible={isOpen}
            onClose={onCancel}
            title={
                <>
                    <h4>
                        <TargetIcon style={{ width: "20px", marginRight: "5px" }} />
                        New asset details
                    </h4>
                </>
            }
        >
            <div>
                <div>
                    <TargetForm newTarget={target} onFormSubmit={onAddTargetFormSubmit} targetSetter={setTarget} />
                </div>

                <div>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton onClick={onAddTargetFormSubmit}>Save</PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default TargetModalDialog;
