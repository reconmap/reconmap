---
title: Attachment limits
parent: Admin manual
---

Uploads are limited by the API. The limits are part of the API configuration, so only administrators can change them; users cannot. The dashboard reads the active values from the API (`GET /api/system/upload-limits`) and shows them next to every upload control, and it checks files against them before sending.

## Configuration

Set the limits under `Storage:Uploads` in the API's `appsettings.json` (mount your own to override it), or with environment variables such as `Storage__Uploads__MaxFileSizeBytes`:

```json
{
  "Storage": {
    "Uploads": {
      "MaxFileSizeBytes": 20971520,
      "MaxFilesPerRequest": 10,
      "MaxCommandOutputBytes": 10485760,
      "AllowedExtensions": [".pdf", ".txt", ".png", ".zip"]
    }
  }
}
```

| Setting                 | Default | Applies to                                                                |
| ----------------------- | ------- | ------------------------------------------------------------------------- |
| `MaxFileSizeBytes`      | 20 MB   | Each attachment. Values above 2 GB - 1 are lowered to 2 GB - 1.            |
| `MaxFilesPerRequest`    | 10      | Number of files in one attachment upload.                                  |
| `MaxCommandOutputBytes` | 10 MB   | A command output file uploaded by a runner or from the dashboard.          |
| `AllowedExtensions`     | see below | Attachment file types, compared case-insensitively. An empty list rejects every attachment. |

Default allowed extensions: `.pdf .txt .md .log .csv .json .xml .yaml .yml .png .jpg .jpeg .gif .webp .doc .docx .xls .xlsx .ppt .pptx .odt .ods .odp .zip .gz .tar .7z .pcap .pcapng`. Active content such as `.html`, `.svg`, `.js` and `.php` is deliberately not included. Command output files are not restricted by type.

## What the API enforces

- A file over the size limit is rejected with `413 Payload Too Large`, and a file type that is not allowed with `415 Unsupported Media Type`. Too many files in one request is a `400 Bad Request`. Nothing is stored when a request is rejected.
- The request body is capped at the per-file limit times the file count (plus 1 MB of multipart overhead) before it is read.
- The content type of a stored or downloaded attachment is derived from the file extension. The type declared by the client is ignored, and unknown extensions are served as `application/octet-stream`.

## Dashboard upload area

The attachment upload area shows these limits under its prompt. Files can be dragged onto it or chosen with the file input. Selected files are listed with their size and can be removed one by one before uploading. The dashboard checks the limits before sending, but the API enforces them regardless.

## Reverse proxy

A proxy in front of the API must allow at least the largest request the API accepts, or it rejects uploads before they reach the API. For nginx, set `client_max_body_size` to `MaxFileSizeBytes` x `MaxFilesPerRequest` (201m with the defaults); the [nginx example](debian-nginx-letsencrypt.md) already does. The dashboard container only serves static files and never receives uploads.

## API documentation endpoints

The OpenAPI document (`/openapi/v1.json`) and the Swagger UI (`/swagger`) are only served when the API runs with `ASPNETCORE_ENVIRONMENT=Development`. They are not available in production deployments, and the dashboard hides the "API docs" menu entry in production builds.
