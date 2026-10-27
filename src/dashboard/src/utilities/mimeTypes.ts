const mimeTypeNames: Record<string, string> = {
    "application/pdf": "PDF document",
    "text/plain": "Text document",
    "text/markdown": "Markdown document",
    "text/csv": "Comma-separated values (CSV)",
    "application/json": "JSON format",
    "application/xml": "XML",
    "text/xml": "XML",
    "application/yaml": "YAML document",
    "application/x-yaml": "YAML document",
    "text/yaml": "YAML document",
    "text/x-yaml": "YAML document",
    "text/html": "HyperText Markup Language (HTML)",
    "image/png": "Portable Network Graphics (PNG)",
    "image/jpeg": "JPEG image",
    "image/gif": "Graphics Interchange Format (GIF)",
    "image/webp": "WebP image",
    "image/svg+xml": "Scalable Vector Graphics (SVG)",
    "application/msword": "Microsoft Word document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Microsoft Word document (OpenXML)",
    "application/vnd.ms-excel": "Microsoft Excel spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Microsoft Excel spreadsheet (OpenXML)",
    "application/vnd.ms-powerpoint": "Microsoft PowerPoint presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "Microsoft PowerPoint presentation (OpenXML)",
    "application/vnd.oasis.opendocument.text": "OpenDocument text document",
    "application/vnd.oasis.opendocument.spreadsheet": "OpenDocument spreadsheet",
    "application/vnd.oasis.opendocument.presentation": "OpenDocument presentation",
    "application/zip": "ZIP archive",
    "application/gzip": "GZip compressed archive",
    "application/x-gzip": "GZip compressed archive",
    "application/x-tar": "Tape archive (TAR)",
    "application/x-7z-compressed": "7-zip archive",
    "application/vnd.tcpdump.pcap": "Packet capture (PCAP)",
    "application/x-pcapng": "Packet capture (PCAPNG)",
    "application/octet-stream": "Binary data",
};

/** Returns a human-friendly name for a MIME type, or the MIME type itself when it is unknown. */
export const mimeTypeName = (mimeType: string): string => {
    const essence = mimeType?.split(";")[0].trim().toLowerCase();
    return mimeTypeNames[essence] ?? mimeType;
};
