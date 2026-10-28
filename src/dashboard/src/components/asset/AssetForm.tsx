import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import AssetTypes from "../../models/AssetTypes";

const AssetForm = ({ newAsset, onFormSubmit, assetSetter: setAsset }: any) => {
    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.value;

        if ("tags" === name) {
            value = JSON.stringify(value.split(","));
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
                            placeholder="e.g. 127.0.0.1"
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />
                <FormField
                    label="Tags"
                    control={<NativeInput name="tags" placeholder="e.g. linux,production" onChange={onFormChange} />}
                />

                <FormField
                    label="Type"
                    control={
                        <NativeSelect name="type" onChange={onFormChange}>
                            {AssetTypes.map((assetType, index) => (
                                <option key={index} value={assetType.value}>
                                    {assetType.description}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
            </Form>
        </div>
    );
};

export default AssetForm;
