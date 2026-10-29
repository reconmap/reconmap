import { requestAssetPost } from "api/requests/assets";
import NativeButton from "components/forms/NativeButton";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import TargetIcon from "components/ui/TargetIcon";
import { toast } from "components/ui/toast";
import AssetTypes from "models/AssetTypes";
import { useState, type FormEvent } from "react";
import AssetForm from "./AssetForm";

const AssetModalDialog = ({ project, isOpen, onSubmit, onCancel }: any) => {
    const emptyAsset = {
        projectId: project.id,
        name: null,
        type: AssetTypes[0].value,
    };
    const [asset, setAsset] = useState(emptyAsset);

    const onAddAssetFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        requestAssetPost(asset)
            .then(() => {
                onSubmit();
                toast.success(`The asset "${asset.name}" has been added.`);
            })
            .catch((err) => {
                toast.error(err);
            })
            .finally(() => {
                setAsset(emptyAsset);
            });
    };

    return (
        <ModalDialog
            visible={isOpen}
            onModalClose={onCancel}
            title={
                <>
                    <TargetIcon style={{ marginRight: "5px" }} />
                    New asset details
                </>
            }
            footer={
                <>
                    <NativeButton onClick={onCancel}>Cancel</NativeButton>
                    <PrimaryButton type="submit" form="asset-form">Save</PrimaryButton>
                </>
            }
        >
            <div>
                <div>
                    <AssetForm newAsset={asset} onFormSubmit={onAddAssetFormSubmit} assetSetter={setAsset} />
                </div>
            </div>
        </ModalDialog>
    );
};

export default AssetModalDialog;
