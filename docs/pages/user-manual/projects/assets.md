---
title: "Assets"
parent: Projects
grand_parent: User manual
---

Assets are everything discovered about the target of a project: servers (by host name or IP address), the ports they expose, the paths of a web application, or a file found on a web page such as a leaked `.env`. Assets form a **tree**, so a port sits under its host, and a path sits under the web application that serves it:

```
example.com
└── 10.0.0.5
    └── 443/tcp
        └── https://example.com
            ├── /admin
            └── /.env
```

Open a project and select the **Assets** tab to browse the tree. Use the arrow next to a node to collapse or expand it. Deleting a node also deletes everything nested under it, and the confirmation tells you how many assets that is.

### Types are free-form

Every asset has an optional **type** (for example `hostname`, `port`, `url`, `parameter`, `file`, `code_location`, `package`, `secret` or `container_image`). The type is only a label that picks the icon and helps you filter. It is not a closed list, so you can type any type and tools can use their own. The form suggests the common ones.

Tools can also attach arbitrary **attributes** to an asset (for example the port number, protocol, service and version of a port, or the HTTP status of a path). They are shown on the asset's page.

### Adding assets

* **Automatically**: output parsers (Nmap, Subfinder, testssl, CycloneDX and the AI parser) create assets, including their hierarchy, when a command result is processed. Assets are identified by their name under their parent, so the same finding in a later scan only updates its *last seen* time and merges its attributes.
* **Manually**: click **New asset** and choose the name, an optional parent and the type.
* **API**: `POST /api/assets` creates an asset, `POST /api/assets/ensure` creates it only if it does not exist yet under the same parent, `PUT /api/assets/{id}` edits or moves it, and `GET /api/assets?projectId=...` lists the assets of a project (add `parentId=...` for the children of a node, `rootsOnly=true` for the top level, or `type=...` to filter). An asset cannot be moved under itself or one of its own descendants.

### Vulnerabilities and assets

A vulnerability can point at any node of the tree through its **Affected asset**, so a finding can be attached to a host, a port or a single file.
