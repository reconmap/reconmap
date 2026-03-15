import { useQueryClient } from "@tanstack/react-query";
import { requestAttachmentPost } from "api/requests/attachments.js";
import PrimaryButton from "components/ui/buttons/Primary";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderStyle: "dashed",
    outline: "none",
    transition: "border .24s ease-in-out",
};

const activeStyle = {};

const acceptStyle = {};

const rejectStyle = {};

const AttachmentsDropzone = ({ parentType, parentId, onUploadFinished = null }) => {
    const queryClient = useQueryClient();

    const onFileDrop = (newFiles) => {
        setAcceptedFiles(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop: onFileDrop,
    });

    const [acceptedFiles, setAcceptedFiles] = useState([]);

    const onUploadButtonClick = (ev) => {
        const formData = new FormData();
        formData.append("parentType", parentType);
        formData.append("parentId", parentId);
        acceptedFiles.forEach((file) => {
            formData.append("attachment[]", file);
        });

        requestAttachmentPost(formData)
            .then(() => {
                setAcceptedFiles([]);
                queryClient.invalidateQueries({ queryKey: ["attachments"] });
                if (onUploadFinished) onUploadFinished();
            })
            .catch((err) => console.error(err));
    };

    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isDragActive ? activeStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isDragActive, isDragAccept, isDragReject],
    );

    return (
        <div className="container">
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here, or click to select files</p>
            </div>
            <aside>
                {acceptedFiles.length === 0 && <div>(upload list empty)</div>}
                {acceptedFiles.length > 0 && (
                    <ul spacing={3}>
                        {acceptedFiles.map((file) => (
                            <li key={file.path}>
                                {file.path} -{file.size} bytes
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
            <hr />
            <PrimaryButton onClick={onUploadButtonClick} disabled={acceptedFiles.length === 0}>
                Upload file(s)
            </PrimaryButton>
        </div>
    );
};

export default AttachmentsDropzone;
