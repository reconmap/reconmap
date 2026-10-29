import { useQueryClient } from "@tanstack/react-query";
import { useUploadLimitsQuery } from "api/system";
import { requestAttachmentPost } from "api/requests/attachments";
import ButtonGroup from "components/ui/buttons/ButtonGroup";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import SecondaryButton from "components/ui/buttons/SecondaryButton";
import CssIcon from "components/ui/CssIcon";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { isAbortError } from "utilities/abort";
import styles from "./AttachmentsDropzone.module.css";

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
    const uploadControllerRef = useRef<AbortController | null>(null);
    const [uploading, setUploading] = useState(false);
    const [acceptedFiles, setAcceptedFiles] = useState<any[]>([]);
    const [dragging, setDragging] = useState(false);
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

    useEffect(() => () => uploadControllerRef.current?.abort(), []);

    const cancelUpload = () => uploadControllerRef.current?.abort();

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

        const controller = new AbortController();
        uploadControllerRef.current = controller;
        setUploading(true);

        uploadFn(formData, { signal: controller.signal })
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
                if (isAbortError(err)) {
                    return;
                }
                console.error(err);
                setError("Upload failed.");
            })
            .finally(() => {
                if (uploadControllerRef.current === controller) {
                    uploadControllerRef.current = null;
                    setUploading(false);
                }
            });
    };

    // The native input renders its own "N files selected" label from input.files, so keep it in step with our state.
    const syncInput = (files: File[]) => {
        const input = inputRef.current;
        if (!input) return;
        if (files.length === 0) {
            input.value = null;
        } else if (typeof DataTransfer !== "undefined") {
            const transfer = new DataTransfer();
            files.forEach((file) => transfer.items.add(file));
            input.files = transfer.files;
        }
    };

    const removeFile = (index: number) => {
        const remaining = acceptedFiles.filter((_, i) => i !== index);
        setAcceptedFiles(remaining);
        syncInput(remaining);
    };

    const clearSelection = () => {
        syncInput([]);
        setAcceptedFiles([]);
        setError(null);
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        const dropped = Array.from(event.dataTransfer.files);
        if (dropped.length === 0) return;
        const files = isAttachment ? dropped : dropped.slice(0, 1);
        onFilesSelected(files);
        syncInput(validate(files) ? [] : files);
    };

    const zoneClass = [styles.zone, dragging && styles.active, disabled && styles.disabled].filter(Boolean).join(" ");

    return (
        <div>
            <div
                className={zoneClass}
                onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                <CssIcon name="cloud-upload-alt" style={{ fontSize: "1.75rem" }} />
                <p className={styles.prompt}>
                    {isAttachment ? "Drag and drop files here, or select them" : "Drag and drop a file here, or select it"}
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    aria-label={isAttachment ? "Select files to upload" : "Select file to upload"}
                    multiple={isAttachment}
                    accept={allowedExtensions?.join(",")}
                    onChange={(event) => onFilesSelected(Array.from(event.target.files!))}
                    disabled={disabled}
                />
                {limits && maxFileSize && (
                    <ul className={styles.limits}>
                        <li>Maximum file size: <strong>{formatBytes(maxFileSize)}</strong></li>
                        {isAttachment && maxFiles && <li>Files per upload: <strong>{maxFiles}</strong></li>}
                        {allowedExtensions && <li>Allowed types: {allowedExtensions.join(", ")}</li>}
                    </ul>
                )}
            </div>

            {error && <p role="alert" className={styles.error}>{error}</p>}

            {acceptedFiles.length > 0 && (
                <>
                    <ul className={styles.files} aria-label="Files to upload">
                        {acceptedFiles.map((file, index) => (
                            <li key={`${file.name}-${index}`} className={styles.file}>
                                <CssIcon name="file" />
                                <span className={styles.fileName} title={file.name}>{file.name}</span>
                                <span className={styles.fileSize}>{formatBytes(file.size)}</span>
                                <button type="button" className={styles.remove} aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)} disabled={disabled}>
                                    <CssIcon name="times" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.actions}>
                        <ButtonGroup>
                            <PrimaryButton onClick={onUploadButtonClick} disabled={disabled || uploading}>
                                {acceptedFiles.length === 1 ? "Upload file" : `Upload ${acceptedFiles.length} files`}
                            </PrimaryButton>
                            {uploading ? (
                                <SecondaryButton onClick={cancelUpload}>Cancel upload</SecondaryButton>
                            ) : (
                                <SecondaryButton onClick={clearSelection} disabled={disabled}>
                                    Clear selection
                                </SecondaryButton>
                            )}
                        </ButtonGroup>
                    </div>
                </>
            )}
        </div>
    );
};

export default AttachmentsDropzone;
