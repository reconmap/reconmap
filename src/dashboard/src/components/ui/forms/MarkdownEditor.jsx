import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./MarkdownEditor.css";

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
    const [mode, setMode] = useState("edit"); // "edit" or "preview"
    const textareaRef = useRef(null);

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

    const handleFormat = (type) => {
        // Switch to edit mode if we are previewing
        if (mode !== "edit") {
            setMode("edit");
        }

        setTimeout(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const selectedText = text.slice(start, end);

            let before = "";
            let after = "";

            switch (type) {
                case "bold":
                    before = "**";
                    after = "**";
                    break;
                case "italic":
                    before = "*";
                    after = "*";
                    break;
                case "header":
                    const needsNewlineBeforeHeader = start > 0 && text[start - 1] !== "\n";
                    before = (needsNewlineBeforeHeader ? "\n" : "") + "### ";
                    after = "";
                    break;
                case "link":
                    before = "[";
                    after = "](url)";
                    break;
                case "code":
                    if (selectedText.includes("\n")) {
                        before = "```\n";
                        after = "\n```";
                    } else {
                        before = "`";
                        after = "`";
                    }
                    break;
                case "list":
                    const needsNewlineBeforeList = start > 0 && text[start - 1] !== "\n";
                    before = (needsNewlineBeforeList ? "\n" : "") + "- ";
                    after = "";
                    break;
                default:
                    break;
            }

            const replacement = before + selectedText + after;
            const nextValue = text.slice(0, start) + replacement + text.slice(end);

            setMarkdown(nextValue);
            emitFormChange(nextValue);

            textarea.focus();
            const newStart = start + before.length;
            const newEnd = newStart + selectedText.length;
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);
    };

    return (
        <div className="markdown-editor">
            <div className="markdown-editor-header">
                <div className="buttons has-addons">
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("bold")}
                        title="Bold"
                    >
                        <i className="fas fa-bold"></i>
                    </button>
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("italic")}
                        title="Italic"
                    >
                        <i className="fas fa-italic"></i>
                    </button>
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("header")}
                        title="Heading"
                    >
                        <i className="fas fa-heading"></i>
                    </button>
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("link")}
                        title="Link"
                    >
                        <i className="fas fa-link"></i>
                    </button>
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("code")}
                        title="Code"
                    >
                        <i className="fas fa-code"></i>
                    </button>
                    <button
                        type="button"
                        className="button is-small is-dark"
                        onClick={() => handleFormat("list")}
                        title="Bullet List"
                    >
                        <i className="fas fa-list"></i>
                    </button>
                </div>
                <div className="tabs is-toggle is-small">
                    <ul>
                        <li className={mode === "edit" ? "is-active" : ""}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMode("edit");
                                }}
                            >
                                Edit
                            </a>
                        </li>
                        <li className={mode === "preview" ? "is-active" : ""}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMode("preview");
                                }}
                            >
                                Preview
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="markdown-editor-content">
                <textarea
                    ref={textareaRef}
                    className="textarea"
                    style={{ display: mode === "edit" ? "block" : "none", minHeight: "200px" }}
                    value={markdown}
                    onPaste={onEditorPaste}
                    onChange={(ev) => {
                        const nextValue = ev.target.value;
                        setMarkdown(nextValue);
                        emitFormChange(nextValue);
                    }}
                    {...options}
                />
                {mode === "preview" && (
                    <div className="box markdown-preview-box">
                        {markdown ? (
                            <div className="content">
                                <ReactMarkdown>{markdown}</ReactMarkdown>
                            </div>
                        ) : (
                            <span className="has-text-grey-light">Nothing to preview</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarkdownEditor;
