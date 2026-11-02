import { type ChangeEvent } from "react";
import { useAssetsQuery } from "api/assets";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import AssetTypeHints from "models/assetTypes";
import { assetPath } from "models/assetTree";

const AssetForm = ({ newAsset, onFormSubmit, assetSetter: setAsset }: any) => {
    const { data: assets } = useAssetsQuery({ projectId: newAsset.projectId });
    const projectAssets: any[] = Array.isArray(assets?.data) ? assets.data : [];

    const onFormChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const name = target.name;
        let value: string | null = target.value;

        if ("tags" === name) {
            value = JSON.stringify(value.split(","));
        } else if ("parentId" === name && value === "") {
            value = null;
        }

        setAsset({ ...newAsset, [name]: value });
    };

    return (
        <div>
            <Form layout="vertical" id="asset-form" onSubmit={onFormSubmit}>
                <FormField
                    label="Name"
                    control={
                        <NativeInput
                            name="name"
                            value={newAsset.name ?? ""}
                            placeholder="e.g. 127.0.0.1, 443/tcp, /admin"
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />
                <FormField
                    label="Parent"
                    control={
                        <NativeSelect name="parentId" value={newAsset.parentId ?? ""} onChange={onFormChange}>
                            <option value="">(none, top level)</option>
                            {projectAssets.map((asset) => (
                                <option key={asset.id} value={asset.id}>
                                    {assetPath(projectAssets, asset.id)
                                        .map((node) => node.name)
                                        .join(" › ")}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
                <FormField
                    label="Type"
                    control={
                        <>
                            <NativeInput
                                name="type"
                                list="asset-type-hints"
                                value={newAsset.type ?? ""}
                                placeholder="e.g. hostname, port, path, file"
                                onChange={onFormChange}
                            />
                            <datalist id="asset-type-hints">
                                {AssetTypeHints.map((hint) => (
                                    <option key={hint.value} value={hint.value}>
                                        {hint.description}
                                    </option>
                                ))}
                            </datalist>
                        </>
                    }
                />
                <FormField
                    label="Tags"
                    control={<NativeInput name="tags" placeholder="e.g. linux,production" onChange={onFormChange} />}
                />
            </Form>
        </div>
    );
};

export default AssetForm;
