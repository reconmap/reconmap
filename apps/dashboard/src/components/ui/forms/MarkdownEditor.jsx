import { useState } from "react";
import "./MarkdownEditor.css";

import MDEditor from "@uiw/react-md-editor";
import Configuration from "Configuration.js";
import { requestEntityPost } from "utilities/requests.js";

const fileUpload = async (file) => {
    const formData = new FormData();
    formData.append("parentType", "project");
    formData.append("parentId", "1");
    formData.append("attachment[]", file);

    let uri = "/attachments";

    const resp = await requestEntityPost(uri, formData);
    const json = await resp.json();
    var attachmentId = json[0].id;
    return Configuration.getDefaultApiUrl() + `/image/${attachmentId}`;
};

const insertToTextArea = (textarea, intsertString) => {
    let sentence = textarea.value;
    const len = sentence.length;
    const pos = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const front = sentence.slice(0, pos);
    const back = sentence.slice(pos, len);

    sentence = front + intsertString + back;

    textarea.value = sentence;
    textarea.selectionEnd = end + intsertString.length;

    return sentence;
};

const onImagePasted = async (ev, setMarkdown) => {
    const dataTransfer = ev.clipboardData;
    const files = [];
    for (let index = 0; index < dataTransfer.items.length; index += 1) {
        const file = dataTransfer.files.item(index);

        if (file) {
            files.push(file);
        }
    }

    const a = await Promise.all(
        files.map(async (file) => {
            const url = await fileUpload(file);
            const insertedMarkdown = insertToTextArea(ev.target, `![${file.name}](${url})`);
            if (!insertedMarkdown) {
                return;
            }
            setMarkdown(insertedMarkdown);
            return insertedMarkdown;
        }),
    );

    return a.join("");
};

const MarkdownEditor = ({ name: editorName, value, onChange: onFormChange, ...options }) => {
    const [markdown, setMarkdown] = useState(value);

    const onEditorPaste = async (ev) => {
        const a = await onImagePasted(ev, setMarkdown);
        onFormChange({ target: { name: editorName, value: a } });
    };

    return (
        <MDEditor
            height={200}
            value={markdown}
            onPaste={onEditorPaste}
            onChange={(editorValue) => {
                setMarkdown(editorValue);
                onFormChange({ target: { name: editorName, value: editorValue } });
            }}
            {...options}
        />
    );
};

export default MarkdownEditor;
