import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeInput from "components/forms/NativeInput";
import NativeSelect from "components/forms/NativeSelect";
import AssetTypes from "../../models/AssetTypes";

const AssetForm = ({ newAsset, onFormSubmit, assetSetter: setAsset }) => {
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
            <form onSubmit={onFormSubmit}>
                <HorizontalLabelledField
                    label="Name"
                    control={
                        <NativeInput
                            name="name"
                            placeholder="e.g. 127.0.0.1"
                            onChange={onFormChange}
                            required
                            autoFocus
                        />
                    }
                />
                <HorizontalLabelledField
                    label="Tags"
                    control={<NativeInput name="tags" placeholder="e.g. linux,production" onChange={onFormChange} />}
                />

                <HorizontalLabelledField
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
            </form>
        </div>
    );
};

export default AssetForm;
