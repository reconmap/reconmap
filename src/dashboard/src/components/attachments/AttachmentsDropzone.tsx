import { useQueryClient } from "@tanstack/react-query";
import { useUploadLimitsQuery } from "api/system";
import { requestAttachmentPost } from "api/requests/attachments";
import ButtonGroup from "components/ui/buttons/ButtonGroup";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import CssIcon from "components/ui/CssIcon";
import { useRef, useState } from "react";


const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
};

const AttachmentsDropzone = ({
    parentType,
    parentId,
    extraParams = {},
    onUploadFinished = null,
    uploadFn = requestAttachmentPost,
    fileFieldName = "attachment[]",
    disabled = false,
    kind = "attachment",
}: any) => {
    const queryClient = useQueryClient();

    const inputRef = useRef<any>(null);
    const [acceptedFiles, setAcceptedFiles] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { data: limits } = useUploadLimitsQuery();

    const isAttachment = kind === "attachment";
    const maxFileSize = isAttachment ? limits?.maxFileSizeBytes : limits?.maxCommandOutputBytes;
    const maxFiles = isAttachment ? limits?.maxFilesPerRequest : 1;
    const allowedExtensions = isAttachment ? limits?.allowedExtensions : undefined;

    // Client-side checks only save a round trip; the API enforces the same limits.
    const validate = (files: File[]): string | null => {
        if (maxFiles && files.length > maxFiles) return `Select at most ${maxFiles} file(s).`;
        for (const file of files) {
            if (maxFileSize && file.size > maxFileSize) return `"${file.name}" is larger than ${formatBytes(maxFileSize)}.`;
            const extension = file.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
            if (allowedExtensions && !allowedExtensions.includes(extension)) return `"${file.name}" has a file type that is not allowed.`;
        }
        return null;
    };

    const onFilesSelected = (files: File[]) => {
        const problem = validate(files);
        setError(problem);
        setAcceptedFiles(problem ? [] : files);
        if (problem && inputRef.current) inputRef.current.value = null;
    };

    const onUploadButtonClick = () => {
        const formData = new FormData();
        if (parentType) formData.append("parentType", parentType);
        if (parentId) formData.append("parentId", parentId);
        Object.entries(extraParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value as any);
            }
        });
        acceptedFiles.forEach((file) => {
            formData.append(fileFieldName, file);
        });

        uploadFn(formData)
            .then(async (res: Response) => {
                if (!res.ok) {
                    const payload = await res.json().catch(() => null);
                    setError(payload?.message ?? `Upload failed (${res.status}).`);
                    return;
                }
                setError(null);
                setAcceptedFiles([]);
                queryClient.invalidateQueries({ queryKey: ["attachments"] });
                if (onUploadFinished) onUploadFinished();
            })
            .catch((err: unknown) => {
                console.error(err);
                setError("Upload failed.");
            });
    };

    return (
        <div className="" style={{ border: "2px dashed #ccc", padding: "20px", textAlign: "center" }}>
            <input
                ref={inputRef}
                type="file"
                multiple={isAttachment}
                accept={allowedExtensions?.join(",")}
                onChange={(e) => onFilesSelected(Array.from(e.target.files!))}
                disabled={disabled}
            />
            {limits && maxFileSize && (
                <ul className="mt-2 text-sm" style={{ listStyle: "none", padding: 0 }}>
                    <li>Maximum file size: <strong>{formatBytes(maxFileSize)}</strong></li>
                    {isAttachment && maxFiles && <li>Files per upload: <strong>{maxFiles}</strong></li>}
                    {allowedExtensions && <li>Allowed types: {allowedExtensions.join(", ")}</li>}
                </ul>
            )}
            {error && <p role="alert" className="mt-2 text-xs" style={{ color: "var(--color-danger, #c00)" }}>{error}</p>}
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
                <SecondaryButton onClick={() => { inputRef.current.value = null; setAcceptedFiles([]); setError(null); }} disabled={disabled || acceptedFiles.length === 0}>
                    Clear file selection
                </SecondaryButton>
            </ButtonGroup>
        </div>
    );
};

export default AttachmentsDropzone;
