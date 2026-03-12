---
title: Configuring CORS
parent: Admin manual
---

The Cross-Origin Resource Sharing ([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)) settings can be found in the `config.json` file in the API backend directory. If the file does not exist, create one using [this template file](https://github.com/reconmap/rest-api/blob/master/config-template.json) as a template.

Edit the content of the file to show (adjusting the values accordingly):

### Allowing any domain from a list

```json
{
  "cors": {
    "allowedOrigins": ["http://localhost:5500", "http://127.0.0.1:5500"]
  }
}
```

### Allowing any origin

**CAUTION:** This configuration is not recommended as it relaxes the security rules for your instance, but it can be handy for debugging purposes.
{: .fw-700 .p-2 .text-red-200 .bg-yellow-100 }

```json
{
  "cors": {
    "allowedOrigins": ["*"]
  }
}
```
