import LabelledField from "components/form/LabelledField";
import NativeSelect from "components/form/NativeSelect";
import NativeTextArea from "components/form/NativeTextArea";

const NotesForm = ({ id, note, onFormSubmit, noteSetter: setNote }) => {
    const onFormInputChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        const value = target.value;

        setNote({ ...note, [name]: value });
    };

    return (
        <form id={id} onSubmit={onFormSubmit}>
            <LabelledField
                label="Content"
                control={
                    <NativeTextArea
                        name="content"
                        style={{ width: "100%" }}
                        onChange={onFormInputChange}
                        value={note.content}
                        required
                        autoFocus
                    ></NativeTextArea>
                }
            />

            <LabelledField
                label="Visibility"
                control={
                    <NativeSelect name="visibility" value={note.visibility} onChange={onFormInputChange}>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </NativeSelect>
                }
            />
        </form>
    );
};

export default NotesForm;
