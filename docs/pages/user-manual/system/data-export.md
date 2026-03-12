---
title: Data export
parent: System
grand_parent: User manual
---

This **System data** page allows you to export data to use between multiple Reconmap instances or to be processed by external scripts and systems.

![System data export screenshot](/images/screenshots/data-export.png)

The export data functionality allows you to export Reconmap data to JSON. The exportable data are:

- Clients
- Commands
- Documents and notes
- Projects and templates (including associated data such as targets)
- Tasks
- Users
- Vulnerabilities

An extract of an JSON export can be see below:

```js
{
  "users": [
    {
      "id": 1,
      "insert_ts": "2021-02-13 20:55:32",
      "update_ts": "2021-02-13 20:55:32",
      "full_name": "Jane Doe",
      "username": "admin",
      "email": "admin@localhost",
      "role": "administrator"
    }
}
```

If you wish to export the audit log, refer to the [audit log section](/user-manual/audit-log.html) user manual.
