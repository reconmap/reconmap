import { useQueryClient } from "@tanstack/react-query";
import { requestAttachmentPost } from "api/requests/attachments.js";
import ButtonGroup from "components/ui/buttons/ButtonGroup.js";
import PrimaryButton from "components/ui/buttons/Primary";
import SecondaryButton from "components/ui/buttons/Secondary.jsx";
import CssIcon from "components/ui/CssIcon.jsx";
import { useRef, useState } from "react";


const AttachmentsDropzone = ({
    parentType,
    parentId,
    extraParams = {},
    onUploadFinished = null,
    uploadFn = requestAttachmentPost,
    fileFieldName = "attachment[]",
    disabled = false,
}) => {
    const queryClient = useQueryClient();

    const inputRef = useRef(null);
    const [acceptedFiles, setAcceptedFiles] = useState([]);

    const onUploadButtonClick = (ev) => {
        const formData = new FormData();
        if (parentType) formData.append("parentType", parentType);
        if (parentId) formData.append("parentId", parentId);
        Object.entries(extraParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        acceptedFiles.forEach((file) => {
            formData.append(fileFieldName, file);
        });

        uploadFn(formData)
            .then(() => {
                setAcceptedFiles([]);
                queryClient.invalidateQueries({ queryKey: ["attachments"] });
                if (onUploadFinished) onUploadFinished();
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="" style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center" }}>
            <input ref={inputRef} type="file" multiple onChange={(e) => setAcceptedFiles(Array.from(e.target.files))} disabled={disabled} />
            <aside className="mt-2">
                {acceptedFiles.length > 0 ? (

                    <div className="mt-4 flex flex-wrap gap-4">
                        {acceptedFiles.map((file) => (
                            <div style={{ display: 'inline-block', maxWidth: '150px' }} key={file.name} className="p-2 border rounded">
                                <CssIcon name="file" style={{ fontSize: "48px" }} />
                                <p className="text-xs text-center text-gray-700 truncate w-full">
                                    {file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>(upload list empty)</div>
                )}
            </aside>
            <hr />

            <ButtonGroup>
                <PrimaryButton onClick={onUploadButtonClick} disabled={disabled || acceptedFiles.length === 0}>
                    Upload file(s)
                </PrimaryButton>
                <SecondaryButton onClick={() => { inputRef.current.value = null; setAcceptedFiles([]); }} disabled={disabled || acceptedFiles.length === 0}>
                    Clear file selection
                </SecondaryButton>
            </ButtonGroup>
        </div>
    );
};

export default AttachmentsDropzone;
