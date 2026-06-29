import { requestAssetPost } from "api/requests/assets.js";
import NativeButton from "components/forms/NativeButton";
import PrimaryButton from "components/ui/buttons/Primary.jsx";
import ModalDialog from "components/ui/ModalDIalog.jsx";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import TargetIcon from "images/icons/target.svg?react";
import AssetTypes from "models/AssetTypes";
import { useState } from "react";
import AssetForm from "./Form";

const AssetModalDialog = ({ project, isOpen, onSubmit, onCancel }) => {
    const emptyAsset = {
        projectId: project.id,
        name: null,
        type: AssetTypes[0].value,
    };
    const [asset, setAsset] = useState(emptyAsset);

    const onAddAssetFormSubmit = (ev) => {
        ev.preventDefault();

        requestAssetPost(asset)
            .then(() => {
                onSubmit();
                actionCompletedToast(`The asset "${asset.name}" has been added.`);
            })
            .catch((err) => {
                errorToast(err);
            })
            .finally(() => {
                setAsset(emptyAsset);
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
                    <AssetForm newAsset={asset} onFormSubmit={onAddAssetFormSubmit} assetSetter={setAsset} />
                </div>

                <div>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton onClick={onAddAssetFormSubmit}>Save</PrimaryButton>
                </div>
            </div>
        </ModalDialog>
    );
};

export default AssetModalDialog;
