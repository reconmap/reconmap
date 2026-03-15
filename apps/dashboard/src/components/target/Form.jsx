import HorizontalLabelledField from "components/form/HorizontalLabelledField";
import NativeInput from "components/form/NativeInput";
import NativeSelect from "components/form/NativeSelect";
import TargetKinds from "../../models/TargetKinds";

const TargetForm = ({ newTarget, onFormSubmit, targetSetter: setTarget }) => {
    const onFormChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.value;

        if ("tags" === name) {
            value = JSON.stringify(value.split(","));
        }

        setTarget({ ...newTarget, [name]: value });
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
                    label="Kind"
                    control={
                        <NativeSelect name="kind" onChange={onFormChange}>
                            {TargetKinds.map((targetKind, index) => (
                                <option key={index} value={targetKind.value}>
                                    {targetKind.description}
                                </option>
                            ))}
                        </NativeSelect>
                    }
                />
            </form>
        </div>
    );
};

export default TargetForm;
