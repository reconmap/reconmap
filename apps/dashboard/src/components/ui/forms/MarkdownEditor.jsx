import { useEffect, useState } from "react";
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

const insertToTextArea = (textarea, insertString) => {
    let sentence = textarea.value;
    const len = sentence.length;
    const pos = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const front = sentence.slice(0, pos);
    const back = sentence.slice(end, len);

    sentence = front + insertString + back;

    textarea.value = sentence;
    textarea.selectionEnd = pos + insertString.length;

    return sentence;
};

const onImagePasted = async (ev) => {
    const dataTransfer = ev.clipboardData;
    const files = [];

    if (!dataTransfer?.items?.length) {
        return null;
    }

    for (let index = 0; index < dataTransfer.items.length; index += 1) {
        const item = dataTransfer.items[index];
        if (item.kind !== "file" || !item.type.startsWith("image/")) {
            continue;
        }

        const file = item.getAsFile();

        if (file) {
            files.push(file);
        }
    }

    if (!files.length) {
        return null;
    }

    ev.preventDefault();

    let insertedMarkdown = ev.target.value || "";
    for (const file of files) {
        const url = await fileUpload(file);
        insertedMarkdown = insertToTextArea(ev.target, `![${file.name}](${url})`);
    }

    return insertedMarkdown;
};

const MarkdownEditor = ({ name: editorName, value, onChange: onFormChange, ...options }) => {
    const [markdown, setMarkdown] = useState(value || "");

    useEffect(() => {
        setMarkdown(value || "");
    }, [value]);

    const emitFormChange = (nextValue) => {
        if (typeof onFormChange !== "function") {
            return;
        }

        onFormChange({
            target: {
                name: editorName,
                value: nextValue,
                type: "text",
            },
        });
    };

    const onEditorPaste = async (ev) => {
        const insertedMarkdown = await onImagePasted(ev);
        if (insertedMarkdown === null) {
            return;
        }

        setMarkdown(insertedMarkdown);
        emitFormChange(insertedMarkdown);
    };

    return (
        <MDEditor
            height={200}
            value={markdown}
            onPaste={onEditorPaste}
            onChange={(editorValue) => {
                const nextValue = editorValue || "";
                setMarkdown(nextValue);
                emitFormChange(nextValue);
            }}
            {...options}
        />
    );
};

export default MarkdownEditor;
